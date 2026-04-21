package br.com.ilumina.service.Llm;

import br.com.ilumina.dto.llm.FlashcardValidado;
import br.com.ilumina.dto.llm.QuestaoValidada;
import br.com.ilumina.exception.BusinessException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LlmValidationServiceTest {

    private LlmValidationService llmValidationService;

    @BeforeEach
    void setUp() {
        llmValidationService = new LlmValidationService(new ObjectMapper());
    }

    @Test
    void validarJsonValidoComTresQuestoesDeveRetornarLista() {
        String jsonValido = """
                {
                  "questoes": [
                    {
                      "enunciado": "Questão 1 sobre o tema informado.",
                      "gabarito": "A",
                      "pontuacao": 1.0,
                      "ordem": 1,
                      "alternativas": [
                        { "letra": "A", "texto": "Alternativa A1" },
                        { "letra": "B", "texto": "Alternativa B1" },
                        { "letra": "C", "texto": "Alternativa C1" },
                        { "letra": "D", "texto": "Alternativa D1" }
                      ]
                    },
                    {
                      "enunciado": "Questão 2 sobre o tema informado.",
                      "gabarito": "B",
                      "pontuacao": 1.0,
                      "ordem": 2,
                      "alternativas": [
                        { "letra": "A", "texto": "Alternativa A2" },
                        { "letra": "B", "texto": "Alternativa B2" },
                        { "letra": "C", "texto": "Alternativa C2" },
                        { "letra": "D", "texto": "Alternativa D2" }
                      ]
                    },
                    {
                      "enunciado": "Questão 3 sobre o tema informado.",
                      "gabarito": "C",
                      "pontuacao": 1.0,
                      "ordem": 3,
                      "alternativas": [
                        { "letra": "A", "texto": "Alternativa A3" },
                        { "letra": "B", "texto": "Alternativa B3" },
                        { "letra": "C", "texto": "Alternativa C3" },
                        { "letra": "D", "texto": "Alternativa D3" }
                      ]
                    }
                  ]
                }
                """;

        List<QuestaoValidada> questoes = llmValidationService.validarEParsear(jsonValido, 3);

        assertThat(questoes).hasSize(3);
        assertThat(questoes.getFirst().gabarito()).isEqualTo('A');
    }

    @Test
    void validarJsonMalformadoDeveLancarBusinessException() {
        String jsonMalformado = "{\"questoes\": [";

        assertThatThrownBy(() -> llmValidationService.validarEParsear(jsonMalformado, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("resposta inválida");
    }

    @Test
    void validarSemCampoQuestoesDeveLancarBusinessException() {
        String jsonSemQuestoes = """
                {
                  "resultado": []
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarEParsear(jsonSemQuestoes, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("fora do formato esperado");
    }

    @Test
    void validarComGabaritoInvalidoDeveLancarBusinessException() {
        String json = """
                {
                  "questoes": [
                    {
                      "enunciado": "Questão inválida",
                      "gabarito": "E",
                      "pontuacao": 1.0,
                      "ordem": 1,
                      "alternativas": [
                        { "letra": "A", "texto": "Alternativa A" },
                        { "letra": "B", "texto": "Alternativa B" },
                        { "letra": "C", "texto": "Alternativa C" },
                        { "letra": "D", "texto": "Alternativa D" }
                      ]
                    }
                  ]
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarEParsear(json, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("gabarito inválido");
    }

    @Test
    void validarComLetraDeAlternativaInvalidaDeveLancarBusinessException() {
        String json = """
                {
                  "questoes": [
                    {
                      "enunciado": "Questão sem alternativa do gabarito",
                      "gabarito": "B",
                      "pontuacao": 1.0,
                      "ordem": 1,
                      "alternativas": [
                        { "letra": "A", "texto": "Alternativa A" },
                        { "letra": "C", "texto": "Alternativa C" },
                        { "letra": "D", "texto": "Alternativa D" },
                        { "letra": "E", "texto": "Alternativa E" }
                      ]
                    }
                  ]
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarEParsear(json, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("letra inválida");
    }

    @Test
    void validarComAlternativasDuplicadasDeveLancarBusinessException() {
        String json = """
                {
                  "questoes": [
                    {
                      "enunciado": "Questão com letras repetidas",
                      "gabarito": "A",
                      "pontuacao": 1.0,
                      "ordem": 1,
                      "alternativas": [
                        { "letra": "A", "texto": "Alternativa A1" },
                        { "letra": "A", "texto": "Alternativa A2" },
                        { "letra": "B", "texto": "Alternativa B" },
                        { "letra": "C", "texto": "Alternativa C" }
                      ]
                    }
                  ]
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarEParsear(json, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("alternativas duplicadas");
    }

    @Test
    void validarComEnunciadosDuplicadosDeveLancarBusinessException() {
        String json = """
                {
                  "questoes": [
                    {
                      "enunciado": "Mesmo enunciado",
                      "gabarito": "A",
                      "pontuacao": 1.0,
                      "ordem": 1,
                      "alternativas": [
                        { "letra": "A", "texto": "A1" },
                        { "letra": "B", "texto": "B1" },
                        { "letra": "C", "texto": "C1" },
                        { "letra": "D", "texto": "D1" }
                      ]
                    },
                    {
                      "enunciado": "Mesmo enunciado",
                      "gabarito": "B",
                      "pontuacao": 1.0,
                      "ordem": 2,
                      "alternativas": [
                        { "letra": "A", "texto": "A2" },
                        { "letra": "B", "texto": "B2" },
                        { "letra": "C", "texto": "C2" },
                        { "letra": "D", "texto": "D2" }
                      ]
                    }
                  ]
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarEParsear(json, 2))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("questões duplicadas");
    }

    @Test
    void validarComUmaAlternativaDeveLancarBusinessException() {
        String json = """
                {
                  "questoes": [
                    {
                      "enunciado": "Questão com uma alternativa",
                      "gabarito": "A",
                      "pontuacao": 1.0,
                      "ordem": 1,
                      "alternativas": [
                        { "letra": "A", "texto": "Alternativa única" }
                      ]
                    }
                  ]
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarEParsear(json, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("quantidade inválida de alternativas");
    }

    @Test
    void validarComCincoAlternativasDeveLancarBusinessException() {
        String json = """
                {
                  "questoes": [
                    {
                      "enunciado": "Questão com cinco alternativas",
                      "gabarito": "A",
                      "pontuacao": 1.0,
                      "ordem": 1,
                      "alternativas": [
                        { "letra": "A", "texto": "A" },
                        { "letra": "B", "texto": "B" },
                        { "letra": "C", "texto": "C" },
                        { "letra": "D", "texto": "D" },
                        { "letra": "A", "texto": "E" }
                      ]
                    }
                  ]
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarEParsear(json, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("quantidade inválida de alternativas");
    }

    @Test
    void validarComTextoAlternativaVazioDeveLancarBusinessException() {
        String json = """
                {
                  "questoes": [
                    {
                      "enunciado": "Questão com texto vazio",
                      "gabarito": "A",
                      "pontuacao": 1.0,
                      "ordem": 1,
                      "alternativas": [
                        { "letra": "A", "texto": " " },
                        { "letra": "B", "texto": "Texto B" },
                        { "letra": "C", "texto": "Texto C" },
                        { "letra": "D", "texto": "Texto D" }
                      ]
                    }
                  ]
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarEParsear(json, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("texto vazio");
    }

    @Test
    void validarFlashcardsJsonValidoDeveRetornarLista() {
        String jsonValido = """
                {
                  "flashcards": [
                    {
                      "textoFrente": "Frente 1",
                      "textoVerso": "Verso 1"
                    },
                    {
                      "textoFrente": "Frente 2",
                      "textoVerso": "Verso 2"
                    }
                  ]
                }
                """;

        List<FlashcardValidado> flashcards = llmValidationService.validarFlashcards(jsonValido, 2);

        assertThat(flashcards).hasSize(2);
        assertThat(flashcards.getFirst().textoFrente()).isEqualTo("Frente 1");
    }

    @Test
    void validarFlashcardsJsonMalformadoDeveLancarBusinessException() {
        String jsonMalformado = "{\"flashcards\": [";

        assertThatThrownBy(() -> llmValidationService.validarFlashcards(jsonMalformado, 1))
                .isInstanceOf(BusinessException.class)
          .hasMessageContaining("resposta invalida para flashcards");
    }

    @Test
    void validarFlashcardsSemRaizFlashcardsDeveLancarBusinessException() {
        String jsonSemRaiz = """
                {
                  "resultado": []
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarFlashcards(jsonSemRaiz, 1))
                .isInstanceOf(BusinessException.class)
    .hasMessageContaining("campo raiz 'flashcards' ausente ou invalido");
    }

    @Test
    void validarFlashcardsComQuantidadeDiferenteDeveLancarBusinessException() {
        String jsonQuantidadeInvalida = """
                {
                  "flashcards": [
                    {
                      "textoFrente": "Frente unica",
                      "textoVerso": "Verso unico"
                    }
                  ]
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarFlashcards(jsonQuantidadeInvalida, 2))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("quantidade de flashcards");
    }

    @Test
    void validarFlashcardsComTextoFrenteVazioDeveLancarBusinessException() {
        String jsonFrenteVazia = """
                {
                  "flashcards": [
                    {
                      "textoFrente": " ",
                      "textoVerso": "Verso valido"
                    }
                  ]
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarFlashcards(jsonFrenteVazia, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("textoFrente");
    }

    @Test
    void validarFlashcardsComTextoFrenteDuplicadoDeveLancarBusinessException() {
        String jsonDuplicado = """
                {
                  "flashcards": [
                    {
                      "textoFrente": "Frente repetida",
                      "textoVerso": "Verso 1"
                    },
                    {
                      "textoFrente": "Frente repetida",
                      "textoVerso": "Verso 2"
                    }
                  ]
                }
                """;

        assertThatThrownBy(() -> llmValidationService.validarFlashcards(jsonDuplicado, 2))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("textoFrente duplicado");
    }
}
