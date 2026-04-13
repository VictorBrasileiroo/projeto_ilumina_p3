package br.com.ilumina.service.Prova;

import br.com.ilumina.dto.prova.AlternativaAlunoResponse;
import br.com.ilumina.dto.prova.ProvaAlunoResponse;
import br.com.ilumina.dto.prova.ProvaDetalheAlunoResponse;
import br.com.ilumina.dto.prova.QuestaoAlunoResponse;
import br.com.ilumina.dto.prova.QuestaoResultadoResponse;
import br.com.ilumina.dto.prova.RespostaItemRequest;
import br.com.ilumina.dto.prova.ResultadoProvaResponse;
import br.com.ilumina.dto.prova.SubmissaoRespostasRequest;
import br.com.ilumina.entity.Aluno.Aluno;
import br.com.ilumina.entity.Prova.Alternativa;
import br.com.ilumina.entity.Prova.ItemRespostaAluno;
import br.com.ilumina.entity.Prova.Prova;
import br.com.ilumina.entity.Prova.Questao;
import br.com.ilumina.entity.Prova.RespostaAluno;
import br.com.ilumina.entity.Prova.StatusProva;
import br.com.ilumina.entity.User.User;
import br.com.ilumina.exception.BusinessException;
import br.com.ilumina.exception.ResourceNotFoundException;
import br.com.ilumina.repository.Aluno.AlunoRepository;
import br.com.ilumina.repository.Prova.AlternativaRepository;
import br.com.ilumina.repository.Prova.ProvaRepository;
import br.com.ilumina.repository.Prova.QuestaoRepository;
import br.com.ilumina.repository.Prova.RespostaAlunoRepository;
import br.com.ilumina.repository.Turma.AlunoTurmaRepository;
import br.com.ilumina.repository.User.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class AlunoProvaService {

    private final ProvaRepository provaRepository;
    private final QuestaoRepository questaoRepository;
    private final AlternativaRepository alternativaRepository;
    private final RespostaAlunoRepository respostaAlunoRepository;
    private final AlunoTurmaRepository alunoTurmaRepository;
    private final AlunoRepository alunoRepository;
    private final UserRepository userRepository;

    public AlunoProvaService(
            ProvaRepository provaRepository,
            QuestaoRepository questaoRepository,
            AlternativaRepository alternativaRepository,
            RespostaAlunoRepository respostaAlunoRepository,
            AlunoTurmaRepository alunoTurmaRepository,
            AlunoRepository alunoRepository,
            UserRepository userRepository
    ) {
        this.provaRepository = provaRepository;
        this.questaoRepository = questaoRepository;
        this.alternativaRepository = alternativaRepository;
        this.respostaAlunoRepository = respostaAlunoRepository;
        this.alunoTurmaRepository = alunoTurmaRepository;
        this.alunoRepository = alunoRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ProvaAlunoResponse> listarProvasParaAluno(String currentUserEmail) {
        Aluno aluno = resolveCurrentAlunoRequiredByEmail(currentUserEmail);

        List<UUID> turmaIds = alunoTurmaRepository.findByAluno_Id(aluno.getId())
                .stream()
                .map(vinculo -> vinculo.getTurma().getId())
                .distinct()
                .toList();

        if (turmaIds.isEmpty()) {
            return List.of();
        }

        return provaRepository.findByTurmaIdInAndStatus(turmaIds, StatusProva.PUBLICADA)
                .stream()
                .sorted(Comparator.comparing(Prova::getCreatedAt).reversed())
                .map(prova -> new ProvaAlunoResponse(
                        prova.getId(),
                        prova.getTitulo(),
                        prova.getDisciplina(),
                        prova.getCreatedAt(),
                        prova.getTurma().getNome(),
                        questaoRepository.countByProvaId(prova.getId()),
                        respostaAlunoRepository.existsByAluno_IdAndProva_Id(aluno.getId(), prova.getId())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProvaDetalheAlunoResponse detalharProvaParaAluno(UUID provaId, String currentUserEmail) {
        Aluno aluno = resolveCurrentAlunoRequiredByEmail(currentUserEmail);
        Prova prova = findProvaById(provaId);

        validarAcessoProvaParaAluno(prova, aluno, true);

        List<QuestaoAlunoResponse> questoes = questaoRepository.findByProvaIdOrderByOrdem(provaId)
                .stream()
                .map(questao -> new QuestaoAlunoResponse(
                        questao.getId(),
                        questao.getEnunciado(),
                        questao.getOrdem(),
                        alternativaRepository.findByQuestaoIdOrderByLetra(questao.getId())
                                .stream()
                                .map(this::toAlternativaAlunoResponse)
                                .toList()
                ))
                .toList();

        return new ProvaDetalheAlunoResponse(
                prova.getId(),
                prova.getTitulo(),
                prova.getDescricao(),
                prova.getDisciplina(),
                prova.getTurma().getId(),
                prova.getTurma().getNome(),
                questoes.size(),
                questoes,
                prova.getCreatedAt()
        );
    }

    @Transactional
    public ResultadoProvaResponse submeterRespostas(
            UUID provaId,
            String currentUserEmail,
            SubmissaoRespostasRequest request
    ) {
        Aluno aluno = resolveCurrentAlunoRequiredByEmail(currentUserEmail);
        Prova prova = findProvaById(provaId);

        validarAcessoProvaParaAluno(prova, aluno, true);

        if (respostaAlunoRepository.existsByAluno_IdAndProva_Id(aluno.getId(), provaId)) {
            throw new DataIntegrityViolationException("Aluno já submeteu respostas para esta prova.");
        }

        List<Questao> questoesDaProva = questaoRepository.findByProvaIdOrderByOrdem(provaId);
        if (questoesDaProva.isEmpty()) {
            throw new BusinessException("Prova não possui questões para submissão.");
        }

        validarQuantidadeRespostas(request.respostas(), questoesDaProva.size());

        Map<UUID, Questao> questoesPorId = new HashMap<>();
        for (Questao questao : questoesDaProva) {
            questoesPorId.put(questao.getId(), questao);
        }

        Set<UUID> questoesRespondidas = new HashSet<>();
        List<ItemRespostaAluno> itens = new ArrayList<>();
        int totalAcertos = 0;
        BigDecimal notaFinal = BigDecimal.ZERO;

        for (RespostaItemRequest resposta : request.respostas()) {
            UUID questaoId = resposta.questaoId();

            if (!questoesRespondidas.add(questaoId)) {
                throw new BusinessException("A mesma questão foi enviada mais de uma vez na submissão.");
            }

            Questao questao = questoesPorId.get(questaoId);
            if (questao == null) {
                throw new BusinessException("Questão informada não pertence à prova.");
            }

            String letraEscolhida = normalizarLetra(resposta.letraEscolhida());
            Set<String> letrasValidas = alternativaRepository.findByQuestaoIdOrderByLetra(questaoId)
                    .stream()
                    .map(Alternativa::getLetra)
                    .map(this::normalizarLetra)
                    .collect(java.util.stream.Collectors.toSet());

            if (!letrasValidas.contains(letraEscolhida)) {
                throw new BusinessException("A letra escolhida não existe nas alternativas da questão.");
            }

            String gabarito = normalizarLetra(questao.getGabarito());
            boolean acertou = letraEscolhida.equals(gabarito);
            BigDecimal pontuacao = Optional.ofNullable(questao.getPontuacao()).orElse(BigDecimal.ZERO);

            if (acertou) {
                totalAcertos++;
                notaFinal = notaFinal.add(pontuacao);
            }

            ItemRespostaAluno item = new ItemRespostaAluno();
            item.setQuestaoId(questaoId);
            item.setEnunciado(questao.getEnunciado());
            item.setOrdem(questao.getOrdem());
            item.setLetraEscolhida(letraEscolhida);
            item.setGabarito(gabarito);
            item.setAcertou(acertou);
            item.setPontuacao(pontuacao);
            itens.add(item);
        }

        RespostaAluno respostaAluno = new RespostaAluno();
        respostaAluno.setAluno(aluno);
        respostaAluno.setProva(prova);
        respostaAluno.setTotalQuestoes(questoesDaProva.size());
        respostaAluno.setTotalAcertos(totalAcertos);
        respostaAluno.setNotaFinal(notaFinal);

        for (ItemRespostaAluno item : itens) {
            item.setRespostaAluno(respostaAluno);
        }

        respostaAluno.setItens(itens);
        RespostaAluno salva = respostaAlunoRepository.save(respostaAluno);

        return toResultadoResponse(salva);
    }

    @Transactional(readOnly = true)
    public ResultadoProvaResponse consultarResultado(UUID provaId, String currentUserEmail) {
        Aluno aluno = resolveCurrentAlunoRequiredByEmail(currentUserEmail);
        Prova prova = findProvaById(provaId);

        Optional<RespostaAluno> respostaExistente = respostaAlunoRepository.findByAluno_IdAndProva_Id(aluno.getId(), provaId);
        if (respostaExistente.isPresent()) {
            return toResultadoResponse(respostaExistente.get());
        }

        validarAcessoProvaParaAluno(prova, aluno, true);
        throw new ResourceNotFoundException("Resultado não encontrado para esta prova.");
    }

    private void validarQuantidadeRespostas(List<RespostaItemRequest> respostas, int totalQuestoes) {
        if (respostas == null || respostas.size() != totalQuestoes) {
            throw new BusinessException("É necessário responder todas as questões da prova.");
        }
    }

    private void validarAcessoProvaParaAluno(Prova prova, Aluno aluno, boolean exigirPublicada) {
        if (exigirPublicada && prova.getStatus() != StatusProva.PUBLICADA) {
            throw new AccessDeniedException("Prova não disponível.");
        }

        if (!alunoTurmaRepository.existsByAluno_IdAndTurma_Id(aluno.getId(), prova.getTurma().getId())) {
            throw new AccessDeniedException("Acesso negado.");
        }
    }

    private Prova findProvaById(UUID provaId) {
        return provaRepository.findById(provaId)
                .orElseThrow(() -> new ResourceNotFoundException("Prova não encontrada."));
    }

    private Aluno resolveCurrentAlunoRequiredByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new AccessDeniedException("Acesso negado.");
        }

        String normalizedEmail = email.trim().toLowerCase();

        return userRepository.findByEmail(normalizedEmail)
                .map(User::getId)
                .flatMap(alunoRepository::findByUserId)
                .orElseThrow(() -> new AccessDeniedException("Acesso negado."));
    }

    private String normalizarLetra(String letra) {
        if (letra == null || letra.isBlank()) {
            throw new BusinessException("A letra escolhida deve ser A, B, C ou D.");
        }

        String normalizada = letra.trim().toUpperCase();
        if (!normalizada.matches("[ABCD]")) {
            throw new BusinessException("A letra escolhida deve ser A, B, C ou D.");
        }

        return normalizada;
    }

    private AlternativaAlunoResponse toAlternativaAlunoResponse(Alternativa alternativa) {
        return new AlternativaAlunoResponse(
                alternativa.getId(),
                alternativa.getLetra(),
                alternativa.getTexto()
        );
    }

    private ResultadoProvaResponse toResultadoResponse(RespostaAluno respostaAluno) {
        List<QuestaoResultadoResponse> questoes = respostaAluno.getItens()
                .stream()
                .sorted(Comparator.comparing(ItemRespostaAluno::getOrdem))
                .map(item -> new QuestaoResultadoResponse(
                        item.getQuestaoId(),
                        item.getEnunciado(),
                        item.getLetraEscolhida(),
                        item.getGabarito(),
                        item.isAcertou(),
                        item.getPontuacao()
                ))
                .toList();

        return new ResultadoProvaResponse(
                respostaAluno.getProva().getId(),
                respostaAluno.getProva().getTitulo(),
                respostaAluno.getTotalQuestoes(),
                respostaAluno.getTotalAcertos(),
                respostaAluno.getNotaFinal(),
                respostaAluno.getRespondidoEm(),
                questoes
        );
    }
}
