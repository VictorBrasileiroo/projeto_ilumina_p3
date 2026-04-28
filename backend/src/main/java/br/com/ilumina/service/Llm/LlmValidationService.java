package br.com.ilumina.service.Llm;

import br.com.ilumina.dto.llm.AlternativaValidada;
import br.com.ilumina.dto.llm.FlashcardValidado;
import br.com.ilumina.dto.llm.QuestaoValidada;
import br.com.ilumina.exception.BusinessException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class LlmValidationService {

    private final ObjectMapper objectMapper;

    public LlmValidationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<QuestaoValidada> validarEParsear(String jsonBruto, int quantidadeEsperada) {
        JsonNode root = parseJson(jsonBruto);

        JsonNode questoesNode = root.get("questoes");
        if (questoesNode == null || !questoesNode.isArray()) {
            throw new BusinessException("Resposta da IA fora do formato esperado.");
        }

        if (questoesNode.isEmpty()) {
            throw new BusinessException("A IA não gerou questões. Tente novamente.");
        }

        if (questoesNode.size() != quantidadeEsperada) {
            throw new BusinessException("A IA retornou quantidade de questões diferente da solicitada.");
        }

        List<QuestaoValidada> questoesValidadas = new ArrayList<>();
        Set<String> enunciadosNormalizados = new HashSet<>();

        for (int i = 0; i < questoesNode.size(); i++) {
            int posicao = i + 1;
            JsonNode questaoNode = questoesNode.get(i);

            String enunciado = extrairTextoObrigatorio(
                    questaoNode.get("enunciado"),
                    "A IA gerou uma questão com enunciado vazio na posição " + posicao + "."
            );

            String chaveEnunciado = enunciado.toLowerCase(Locale.ROOT);
            if (!enunciadosNormalizados.add(chaveEnunciado)) {
                throw new BusinessException("A IA gerou questões duplicadas. Tente novamente.");
            }

            char gabarito = validarEExtrairGabarito(questaoNode.get("gabarito"), posicao);
            BigDecimal pontuacao = extrairPontuacao(questaoNode.get("pontuacao"), posicao);
            int ordem = extrairOrdem(questaoNode.get("ordem"), posicao);

            JsonNode alternativasNode = questaoNode.get("alternativas");
            List<AlternativaValidada> alternativasValidadas = validarEExtrairAlternativas(alternativasNode, posicao);

            Set<Character> letrasAlternativas = new HashSet<>();
            for (AlternativaValidada alternativa : alternativasValidadas) {
                letrasAlternativas.add(alternativa.letra());
            }

            if (!letrasAlternativas.contains(gabarito)) {
                throw new BusinessException("A IA gerou uma questão com gabarito inválido na posição " + posicao + ".");
            }

            questoesValidadas.add(
                    new QuestaoValidada(
                            enunciado,
                            gabarito,
                            pontuacao,
                            ordem,
                            alternativasValidadas
                    )
            );
        }

        return questoesValidadas;
    }

    public List<FlashcardValidado> validarFlashcards(String jsonBruto, int quantidadeEsperada) {
        JsonNode root;
        try {
            root = parseJson(jsonBruto);
        } catch (BusinessException ex) {
            throw invalidFlashcards("JSON invalido.");
        }

        JsonNode flashcardsNode = root.get("flashcards");
        if (flashcardsNode == null || !flashcardsNode.isArray()) {
            throw invalidFlashcards("campo raiz 'flashcards' ausente ou invalido.");
        }

        if (flashcardsNode.isEmpty()) {
            throw invalidFlashcards("nenhum flashcard foi retornado.");
        }

        if (quantidadeEsperada > 0 && flashcardsNode.size() != quantidadeEsperada) {
            throw invalidFlashcards("quantidade de flashcards diferente da solicitada.");
        }

        List<FlashcardValidado> flashcardsValidados = new ArrayList<>();
        Set<String> frentesNormalizadas = new HashSet<>();

        for (int i = 0; i < flashcardsNode.size(); i++) {
            int posicao = i + 1;
            JsonNode flashcardNode = flashcardsNode.get(i);

            String textoFrente;
            String textoVerso;
            try {
                textoFrente = extrairTextoObrigatorio(
                        flashcardNode.get("textoFrente"),
                        "flashcard com textoFrente vazio na posicao " + posicao + "."
                );
                textoVerso = extrairTextoObrigatorio(
                        flashcardNode.get("textoVerso"),
                        "flashcard com textoVerso vazio na posicao " + posicao + "."
                );
            } catch (BusinessException ex) {
                throw invalidFlashcards(ex.getMessage());
            }

            String chaveFrente = textoFrente.toLowerCase(Locale.ROOT);
            if (!frentesNormalizadas.add(chaveFrente)) {
                throw invalidFlashcards("flashcards com textoFrente duplicado na mesma geracao.");
            }

            flashcardsValidados.add(new FlashcardValidado(textoFrente, textoVerso));
        }

        return flashcardsValidados;
    }

    private JsonNode parseJson(String jsonBruto) {
        if (jsonBruto == null || jsonBruto.isBlank()) {
            throw new BusinessException("A IA retornou uma resposta inválida. Tente novamente.");
        }

        try {
            return objectMapper.readTree(jsonBruto);
        } catch (JsonProcessingException ex) {
            throw new BusinessException("A IA retornou uma resposta inválida. Tente novamente.");
        }
    }

    private char validarEExtrairGabarito(JsonNode gabaritoNode, int posicao) {
        String gabarito = extrairTextoObrigatorio(
                gabaritoNode,
                "A IA gerou uma questão com gabarito inválido na posição " + posicao + "."
        ).toUpperCase(Locale.ROOT);

        if (gabarito.length() != 1 || "ABCD".indexOf(gabarito.charAt(0)) < 0) {
            throw new BusinessException("A IA gerou uma questão com gabarito inválido na posição " + posicao + ".");
        }

        return gabarito.charAt(0);
    }

    private BigDecimal extrairPontuacao(JsonNode pontuacaoNode, int posicao) {
        if (pontuacaoNode == null || pontuacaoNode.isNull()) {
            return BigDecimal.ONE;
        }

        if (!pontuacaoNode.isNumber()) {
            throw new BusinessException("A IA gerou uma pontuação inválida na posição " + posicao + ".");
        }

        return pontuacaoNode.decimalValue();
    }

    private int extrairOrdem(JsonNode ordemNode, int fallbackOrdem) {
        if (ordemNode == null || ordemNode.isNull()) {
            return fallbackOrdem;
        }

        if (!ordemNode.isInt()) {
            return fallbackOrdem;
        }

        int ordem = ordemNode.asInt();
        return ordem > 0 ? ordem : fallbackOrdem;
    }

    private List<AlternativaValidada> validarEExtrairAlternativas(JsonNode alternativasNode, int posicaoQuestao) {
        if (alternativasNode == null || !alternativasNode.isArray()) {
            throw new BusinessException("Resposta da IA fora do formato esperado.");
        }

        if (alternativasNode.size() != 4) {
            throw new BusinessException("A IA gerou uma questão com quantidade inválida de alternativas na posição " + posicaoQuestao + ". São esperadas exatamente 4 alternativas.");
        }

        List<AlternativaValidada> alternativas = new ArrayList<>();
        Set<Character> letras = new HashSet<>();

        for (int i = 0; i < alternativasNode.size(); i++) {
            JsonNode alternativaNode = alternativasNode.get(i);

            String letraTexto = extrairTextoObrigatorio(
                    alternativaNode.get("letra"),
                    "A IA gerou uma alternativa com letra inválida na posição " + posicaoQuestao + "."
            ).toUpperCase(Locale.ROOT);

            if (letraTexto.length() != 1 || "ABCD".indexOf(letraTexto.charAt(0)) < 0) {
                throw new BusinessException("A IA gerou uma alternativa com letra inválida na posição " + posicaoQuestao + ".");
            }

            char letra = letraTexto.charAt(0);
            if (!letras.add(letra)) {
                throw new BusinessException("A IA gerou alternativas duplicadas na posição " + posicaoQuestao + ".");
            }

            String texto = extrairTextoObrigatorio(
                    alternativaNode.get("texto"),
                    "A IA gerou uma alternativa com texto vazio na posição " + posicaoQuestao + "."
            );

            alternativas.add(new AlternativaValidada(letra, texto));
        }

        return alternativas;
    }

    private String extrairTextoObrigatorio(JsonNode node, String mensagemErro) {
        if (node == null || node.isNull() || !node.isTextual()) {
            throw new BusinessException(mensagemErro);
        }

        String valor = node.asText().trim();
        if (valor.isEmpty()) {
            throw new BusinessException(mensagemErro);
        }

        return valor;
    }

    private BusinessException invalidFlashcards(String motivo) {
        return new BusinessException("LLM retornou resposta invalida para flashcards: " + motivo);
    }
}
