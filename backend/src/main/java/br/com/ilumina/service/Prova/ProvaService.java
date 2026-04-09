package br.com.ilumina.service.Prova;

import br.com.ilumina.dto.prova.AlternativaResponse;
import br.com.ilumina.dto.prova.CreateAlternativaRequest;
import br.com.ilumina.dto.prova.CreateProvaRequest;
import br.com.ilumina.dto.prova.CreateQuestaoRequest;
import br.com.ilumina.dto.prova.ProvaDetalheResponse;
import br.com.ilumina.dto.prova.ProvaResponse;
import br.com.ilumina.dto.prova.QuestaoResponse;
import br.com.ilumina.dto.prova.UpdateAlternativaRequest;
import br.com.ilumina.dto.prova.UpdateProvaRequest;
import br.com.ilumina.dto.prova.UpdateQuestaoRequest;
import br.com.ilumina.entity.Professor.Professor;
import br.com.ilumina.entity.Prova.Alternativa;
import br.com.ilumina.entity.Prova.Prova;
import br.com.ilumina.entity.Prova.Questao;
import br.com.ilumina.entity.Prova.StatusProva;
import br.com.ilumina.entity.Turma.Turma;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.exception.BusinessException;
import br.com.ilumina.exception.ResourceNotFoundException;
import br.com.ilumina.repository.Professor.ProfessorRepository;
import br.com.ilumina.repository.Prova.AlternativaRepository;
import br.com.ilumina.repository.Prova.ProvaRepository;
import br.com.ilumina.repository.Prova.QuestaoRepository;
import br.com.ilumina.repository.Turma.ProfTurmaRepository;
import br.com.ilumina.repository.Turma.TurmaRepository;
import br.com.ilumina.repository.User.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class ProvaService {

    private final ProvaRepository provaRepository;
    private final QuestaoRepository questaoRepository;
    private final AlternativaRepository alternativaRepository;
    private final ProfessorRepository professorRepository;
    private final TurmaRepository turmaRepository;
    private final ProfTurmaRepository profTurmaRepository;
    private final UserRepository userRepository;

    public ProvaService(
            ProvaRepository provaRepository,
            QuestaoRepository questaoRepository,
            AlternativaRepository alternativaRepository,
            ProfessorRepository professorRepository,
            TurmaRepository turmaRepository,
            ProfTurmaRepository profTurmaRepository,
            UserRepository userRepository
    ) {
        this.provaRepository = provaRepository;
        this.questaoRepository = questaoRepository;
        this.alternativaRepository = alternativaRepository;
        this.professorRepository = professorRepository;
        this.turmaRepository = turmaRepository;
        this.profTurmaRepository = profTurmaRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ProvaResponse criar(
            CreateProvaRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Optional<Professor> currentProfessor = resolveCurrentProfessorByEmail(currentUserEmail);
        if (currentProfessor.isEmpty()) {
            if (isAdmin) {
                throw new BusinessException("É necessário ter perfil de professor para criar provas.");
            }
            throw new AccessDeniedException("Acesso negado.");
        }

        Professor professor = currentProfessor.get();

        Turma turma = turmaRepository.findById(request.turmaId())
                .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada."));

        validateTurmaAtiva(turma);

        if (!profTurmaRepository.existsByProfessor_IdAndTurma_Id(professor.getId(), turma.getId())) {
            throw new BusinessException("Professor não está vinculado à turma informada.");
        }

        Prova prova = new Prova();
        prova.setTitulo(normalizeRequired(request.titulo(), "O título é obrigatório."));
        prova.setDescricao(normalizeOptional(request.descricao()));
        prova.setDisciplina(normalizeOptional(request.disciplina()));
        prova.setQntQuestoes(request.qntQuestoes());
        prova.setStatus(StatusProva.RASCUNHO);
        prova.setProfessor(professor);
        prova.setTurma(turma);

        Prova saved = provaRepository.save(prova);
        return toProvaResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProvaResponse> listar(
            String currentUserEmail,
            boolean isAdmin
    ) {
        List<Prova> provas;

        if (isAdmin) {
            provas = provaRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else {
            Professor professor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);
            provas = provaRepository.findByProfessorIdOrderByCreatedAtDesc(professor.getId());
        }

        return provas.stream()
                .map(this::toProvaResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProvaDetalheResponse detalhar(
            UUID provaId,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Prova prova = findProvaById(provaId);
        validateOwnership(prova, currentUserEmail, isAdmin);

        List<QuestaoResponse> questoes = buildQuestoesResponse(prova.getId());

        return new ProvaDetalheResponse(
                prova.getId(),
                prova.getTitulo(),
                prova.getDescricao(),
                prova.getDisciplina(),
                prova.getQntQuestoes(),
                prova.getStatus(),
                prova.getTurma().getId(),
                prova.getTurma().getNome(),
                prova.getProfessor().getId(),
                prova.getProfessor().getUser().getName(),
                questoes,
                prova.getCreatedAt(),
                prova.getUpdatedAt()
        );
    }

    @Transactional
    public ProvaResponse atualizar(
            UUID provaId,
            UpdateProvaRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Prova prova = findProvaById(provaId);
        validateOwnership(prova, currentUserEmail, isAdmin);
        validateProvaEmRascunho(prova, "Apenas provas em rascunho podem ser editadas.");

        if (request.titulo() != null) {
            prova.setTitulo(normalizeRequired(request.titulo(), "O título não pode ser vazio."));
        }

        if (request.descricao() != null) {
            prova.setDescricao(normalizeOptional(request.descricao()));
        }

        if (request.disciplina() != null) {
            prova.setDisciplina(normalizeOptional(request.disciplina()));
        }

        if (request.qntQuestoes() != null) {
            prova.setQntQuestoes(request.qntQuestoes());
        }

        if (request.turmaId() != null && !request.turmaId().equals(prova.getTurma().getId())) {
            Turma novaTurma = turmaRepository.findById(request.turmaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Turma não encontrada."));

            validateTurmaAtiva(novaTurma);

            UUID professorDonoId = prova.getProfessor().getId();
            if (!profTurmaRepository.existsByProfessor_IdAndTurma_Id(professorDonoId, novaTurma.getId())) {
                throw new BusinessException("Professor da prova não está vinculado à nova turma informada.");
            }

            prova.setTurma(novaTurma);
        }

        Prova saved = provaRepository.save(prova);
        return toProvaResponse(saved);
    }

    @Transactional
    public void excluir(
            UUID provaId,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Prova prova = findProvaById(provaId);
        validateOwnership(prova, currentUserEmail, isAdmin);
        validateProvaEmRascunho(prova, "Despublique a prova antes de excluí-la.");

        provaRepository.delete(prova);
    }

    @Transactional
    public QuestaoResponse adicionarQuestao(
            UUID provaId,
            CreateQuestaoRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Prova prova = findProvaById(provaId);
        validateOwnership(prova, currentUserEmail, isAdmin);
        validateProvaEmRascunho(prova, "Apenas provas em rascunho podem receber novas questões.");

        Set<String> letras = validateAlternativas(request.alternativas());
        validateGabaritoMatchesAlternativas(request.gabarito(), letras);

        Questao questao = new Questao();
        questao.setProva(prova);
        questao.setEnunciado(normalizeRequired(request.enunciado(), "O enunciado é obrigatório."));
        questao.setGabarito(request.gabarito().trim().toUpperCase());
        questao.setPontuacao(request.pontuacao());
        questao.setOrdem(resolveOrdemParaCriacao(prova.getId(), request.ordem()));

        List<Alternativa> alternativas = new ArrayList<>();
        for (CreateAlternativaRequest alternativaRequest : request.alternativas()) {
            Alternativa alternativa = new Alternativa();
            alternativa.setQuestao(questao);
            alternativa.setTexto(normalizeRequired(alternativaRequest.texto(), "O texto da alternativa é obrigatório."));
            alternativa.setLetra(alternativaRequest.letra().trim().toUpperCase());
            alternativas.add(alternativa);
        }

        questao.setAlternativas(alternativas);

        Questao saved = questaoRepository.save(questao);
        List<AlternativaResponse> alternativasResponse = saved.getAlternativas().stream()
                .sorted(Comparator.comparing(Alternativa::getLetra))
                .map(this::toAlternativaResponse)
                .toList();

        return toQuestaoResponse(saved, alternativasResponse);
    }

    @Transactional
    public QuestaoResponse atualizarQuestao(
            UUID provaId,
            UUID questaoId,
            UpdateQuestaoRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Prova prova = findProvaById(provaId);
        validateOwnership(prova, currentUserEmail, isAdmin);
        validateProvaEmRascunho(prova, "Apenas provas em rascunho podem ter questões editadas.");

        Questao questao = questaoRepository.findById(questaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Questão não encontrada."));

        validateQuestaoPertenceAProva(questao, provaId);

        if (request.enunciado() != null) {
            questao.setEnunciado(normalizeRequired(request.enunciado(), "O enunciado não pode ser vazio."));
        }

        if (request.pontuacao() != null) {
            questao.setPontuacao(request.pontuacao());
        }

        if (request.ordem() != null) {
            if (request.ordem() < 1) {
                throw new BusinessException("A ordem deve ser no mínimo 1.");
            }

            validateOrdemUnicaNaProva(provaId, request.ordem(), questaoId);
            questao.setOrdem(request.ordem());
        }

        if (request.gabarito() != null) {
            List<Alternativa> alternativasAtuais = alternativaRepository.findByQuestaoIdOrderByLetra(questaoId);
            Set<String> letras = alternativasAtuais.stream()
                    .map(Alternativa::getLetra)
                    .map(String::toUpperCase)
                    .collect(java.util.stream.Collectors.toSet());

            validateGabaritoMatchesAlternativas(request.gabarito(), letras);
            questao.setGabarito(request.gabarito().trim().toUpperCase());
        }

        Questao saved = questaoRepository.save(questao);
        List<AlternativaResponse> alternativasResponse = alternativaRepository.findByQuestaoIdOrderByLetra(saved.getId())
                .stream()
                .map(this::toAlternativaResponse)
                .toList();

        return toQuestaoResponse(saved, alternativasResponse);
    }

    @Transactional
    public void removerQuestao(
            UUID provaId,
            UUID questaoId,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Prova prova = findProvaById(provaId);
        validateOwnership(prova, currentUserEmail, isAdmin);
        validateProvaEmRascunho(prova, "Apenas provas em rascunho podem ter questões removidas.");

        Questao questao = questaoRepository.findById(questaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Questão não encontrada."));

        validateQuestaoPertenceAProva(questao, provaId);

        questaoRepository.delete(questao);
        reordenarQuestoesSemGaps(provaId);
    }

    @Transactional
    public AlternativaResponse atualizarAlternativa(
            UUID provaId,
            UUID questaoId,
            UUID alternativaId,
            UpdateAlternativaRequest request,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Prova prova = findProvaById(provaId);
        validateOwnership(prova, currentUserEmail, isAdmin);
        validateProvaEmRascunho(prova, "Apenas provas em rascunho podem ter alternativas editadas.");

        Questao questao = questaoRepository.findById(questaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Questão não encontrada."));
        validateQuestaoPertenceAProva(questao, provaId);

        Alternativa alternativa = alternativaRepository.findById(alternativaId)
                .orElseThrow(() -> new ResourceNotFoundException("Alternativa não encontrada."));

        if (!alternativa.getQuestao().getId().equals(questaoId)) {
            throw new BusinessException("Alternativa não pertence à questão informada.");
        }

        alternativa.setTexto(normalizeRequired(request.texto(), "O texto da alternativa é obrigatório."));
        Alternativa saved = alternativaRepository.save(alternativa);

        return toAlternativaResponse(saved);
    }

    @Transactional
    public ProvaResponse publicar(
            UUID provaId,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Prova prova = findProvaById(provaId);
        validateOwnership(prova, currentUserEmail, isAdmin);

        if (prova.getStatus() != StatusProva.RASCUNHO) {
            throw new BusinessException("Prova já está publicada.");
        }

        validateProvaParaPublicacao(prova.getId());

        prova.setStatus(StatusProva.PUBLICADA);
        Prova saved = provaRepository.save(prova);

        return toProvaResponse(saved);
    }

    @Transactional
    public ProvaResponse despublicar(
            UUID provaId,
            String currentUserEmail,
            boolean isAdmin
    ) {
        Prova prova = findProvaById(provaId);
        validateOwnership(prova, currentUserEmail, isAdmin);

        if (prova.getStatus() != StatusProva.PUBLICADA) {
            throw new BusinessException("Prova já está em rascunho.");
        }

        // TODO: Quando o módulo de respostas do aluno existir, bloquear despublicação
        // para provas com respostas registradas, conforme decisão de produto.
        prova.setStatus(StatusProva.RASCUNHO);
        Prova saved = provaRepository.save(prova);

        return toProvaResponse(saved);
    }

    private void validateProvaParaPublicacao(UUID provaId) {
        List<Questao> questoes = questaoRepository.findByProvaIdOrderByOrdem(provaId);

        if (questoes.isEmpty()) {
            throw new BusinessException("Prova sem questões não pode ser publicada.");
        }

        for (Questao questao : questoes) {
            List<Alternativa> alternativas = alternativaRepository.findByQuestaoIdOrderByLetra(questao.getId());

            if (alternativas.size() < 2 || alternativas.size() > 4) {
                throw new BusinessException("Questão inválida para publicação: cada questão deve ter entre 2 e 4 alternativas.");
            }

            Set<String> letras = new HashSet<>();
            for (Alternativa alternativa : alternativas) {
                String letra = normalizeRequired(alternativa.getLetra(), "Letra da alternativa não pode ser vazia.")
                        .toUpperCase();
                if (!letras.add(letra)) {
                    throw new BusinessException("Questão inválida para publicação: alternativas com letras duplicadas.");
                }
            }

            validateGabaritoMatchesAlternativas(questao.getGabarito(), letras);
        }
    }

    private void validateQuestaoPertenceAProva(Questao questao, UUID provaId) {
        if (!questao.getProva().getId().equals(provaId)) {
            throw new BusinessException("Questão não pertence à prova informada.");
        }
    }

    private void validateProvaEmRascunho(Prova prova, String message) {
        if (prova.getStatus() != StatusProva.RASCUNHO) {
            throw new BusinessException(message);
        }
    }

    private void validateOwnership(Prova prova, String currentUserEmail, boolean isAdmin) {
        if (isAdmin) {
            return;
        }

        Professor currentProfessor = resolveCurrentProfessorRequiredByEmail(currentUserEmail);
        if (!prova.getProfessor().getId().equals(currentProfessor.getId())) {
            throw new AccessDeniedException("Acesso negado.");
        }
    }

    private void validateTurmaAtiva(Turma turma) {
        if (!turma.isActive()) {
            throw new BusinessException("Turma inativa não pode receber provas.");
        }
    }

    private Set<String> validateAlternativas(List<CreateAlternativaRequest> alternativas) {
        if (alternativas == null || alternativas.size() < 2 || alternativas.size() > 4) {
            throw new BusinessException("A questão deve ter entre 2 e 4 alternativas.");
        }

        Set<String> letras = new HashSet<>();
        for (CreateAlternativaRequest alternativa : alternativas) {
            String letra = normalizeRequired(alternativa.letra(), "A letra da alternativa é obrigatória.")
                    .toUpperCase();
            if (!letras.add(letra)) {
                throw new BusinessException("As letras das alternativas devem ser únicas na questão.");
            }
        }

        return letras;
    }

    private void validateGabaritoMatchesAlternativas(String gabarito, Set<String> letrasAlternativas) {
        String normalized = normalizeRequired(gabarito, "O gabarito é obrigatório.").toUpperCase();
        if (!letrasAlternativas.contains(normalized)) {
            throw new BusinessException("O gabarito deve corresponder a uma alternativa existente.");
        }
    }

    private Integer resolveOrdemParaCriacao(UUID provaId, Integer ordemRequest) {
        if (ordemRequest != null) {
            if (ordemRequest < 1) {
                throw new BusinessException("A ordem deve ser no mínimo 1.");
            }

            validateOrdemUnicaNaProva(provaId, ordemRequest, null);
            return ordemRequest;
        }

        return questaoRepository.findByProvaIdOrderByOrdem(provaId)
                .stream()
                .map(Questao::getOrdem)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }

    private void validateOrdemUnicaNaProva(UUID provaId, Integer ordem, UUID questaoIdIgnorada) {
        boolean ordemEmUso = questaoIdIgnorada == null
                ? questaoRepository.existsByProvaIdAndOrdem(provaId, ordem)
                : questaoRepository.existsByProvaIdAndOrdemAndIdNot(provaId, ordem, questaoIdIgnorada);

        if (ordemEmUso) {
            throw new BusinessException("Já existe outra questão da mesma prova com aquela ordem.");
        }
    }

    private void reordenarQuestoesSemGaps(UUID provaId) {
        List<Questao> questoes = questaoRepository.findByProvaIdOrderByOrdem(provaId)
                .stream()
                .sorted(
                        Comparator.comparing(Questao::getOrdem, Comparator.nullsLast(Integer::compareTo))
                                .thenComparing(Questao::getCreatedAt)
                )
                .toList();

        for (int i = 0; i < questoes.size(); i++) {
            questoes.get(i).setOrdem(i + 1);
        }

        questaoRepository.saveAll(questoes);
    }

    private List<QuestaoResponse> buildQuestoesResponse(UUID provaId) {
        List<Questao> questoes = questaoRepository.findByProvaIdOrderByOrdem(provaId);

        return questoes.stream()
                .map(questao -> {
                    List<AlternativaResponse> alternativas = alternativaRepository.findByQuestaoIdOrderByLetra(questao.getId())
                            .stream()
                            .map(this::toAlternativaResponse)
                            .toList();
                    return toQuestaoResponse(questao, alternativas);
                })
                .toList();
    }

    private ProvaResponse toProvaResponse(Prova prova) {
        long totalQuestoes = questaoRepository.countByProvaId(prova.getId());

        return new ProvaResponse(
                prova.getId(),
                prova.getTitulo(),
                prova.getDisciplina(),
                prova.getStatus(),
                prova.getTurma().getId(),
                prova.getTurma().getNome(),
                prova.getProfessor().getId(),
                prova.getProfessor().getUser().getName(),
                totalQuestoes,
                prova.getCreatedAt(),
                prova.getUpdatedAt()
        );
    }

    private QuestaoResponse toQuestaoResponse(Questao questao, List<AlternativaResponse> alternativas) {
        return new QuestaoResponse(
                questao.getId(),
                questao.getEnunciado(),
                questao.getGabarito(),
                questao.getPontuacao(),
                questao.getOrdem(),
                alternativas,
                questao.getCreatedAt(),
                questao.getUpdatedAt()
        );
    }

    private AlternativaResponse toAlternativaResponse(Alternativa alternativa) {
        return new AlternativaResponse(
                alternativa.getId(),
                alternativa.getLetra(),
                alternativa.getTexto(),
                alternativa.getCreatedAt(),
                alternativa.getUpdatedAt()
        );
    }

    private Prova findProvaById(UUID provaId) {
        return provaRepository.findById(provaId)
                .orElseThrow(() -> new ResourceNotFoundException("Prova não encontrada."));
    }

    private Optional<Professor> resolveCurrentProfessorByEmail(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }

        String normalizedEmail = email.trim().toLowerCase();

        return userRepository.findByEmail(normalizedEmail)
                .map(User::getId)
                .flatMap(professorRepository::findByUserId);
    }

    private Professor resolveCurrentProfessorRequiredByEmail(String email) {
        return resolveCurrentProfessorByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Acesso negado."));
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
