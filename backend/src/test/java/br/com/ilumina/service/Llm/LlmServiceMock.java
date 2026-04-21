package br.com.ilumina.service.Llm;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@Primary
@Profile("test")
public class LlmServiceMock implements LlmService {

    private final Queue<String> respostasEnfileiradas = new ConcurrentLinkedQueue<>();
    private volatile RuntimeException excecaoForcada;

    @Override
    public String gerarQuestoes(String prompt, int quantidadeEsperada) {
        if (excecaoForcada != null) {
            throw excecaoForcada;
        }

        String resposta = respostasEnfileiradas.poll();
        if (resposta != null) {
            return resposta;
        }

        return gerarJsonValidoParaTeste(quantidadeEsperada);
    }

      @Override
      public String gerarFlashcards(String prompt, int quantidadeEsperada) {
        if (excecaoForcada != null) {
          throw excecaoForcada;
        }

        String resposta = respostasEnfileiradas.poll();
        if (resposta != null) {
          return resposta;
        }

        return gerarJsonFlashcardsValidoParaTeste(quantidadeEsperada);
      }

    public void enfileirarResposta(String respostaJson) {
        respostasEnfileiradas.add(respostaJson);
    }

    public void forcarExcecao(RuntimeException excecao) {
        this.excecaoForcada = excecao;
    }

    public void reset() {
        respostasEnfileiradas.clear();
        excecaoForcada = null;
    }

    public String gerarJsonValidoParaTeste(int quantidade) {
        StringBuilder json = new StringBuilder();
        json.append("{\"questoes\":[");

        for (int i = 1; i <= quantidade; i++) {
            if (i > 1) {
                json.append(',');
            }

            json.append("{\"enunciado\":\"Pergunta ").append(i).append(" sobre o tema informado?\",")
                    .append("\"gabarito\":\"A\",")
                    .append("\"pontuacao\":1.0,")
                    .append("\"ordem\":").append(i).append(',')
                    .append("\"alternativas\":[")
                    .append("{\"letra\":\"A\",\"texto\":\"Alternativa correta ").append(i).append("\"},")
                    .append("{\"letra\":\"B\",\"texto\":\"Distrator B ").append(i).append("\"},")
                    .append("{\"letra\":\"C\",\"texto\":\"Distrator C ").append(i).append("\"},")
                    .append("{\"letra\":\"D\",\"texto\":\"Distrator D ").append(i).append("\"}")
                    .append("]}");
        }

        json.append("]}");
        return json.toString();
    }

    public String gerarJsonComGabaritoInvalidoParaTeste() {
        return """
                {
                  "questoes": [
                    {
                      "enunciado": "Questão com gabarito inválido",
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
    }

    public String gerarJsonComQuestoesDuplicadasParaTeste() {
        return """
                {
                  "questoes": [
                    {
                      "enunciado": "Questão duplicada",
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
                      "enunciado": "Questão duplicada",
                      "gabarito": "B",
                      "pontuacao": 1.0,
                      "ordem": 2,
                      "alternativas": [
                        { "letra": "A", "texto": "Alternativa A2" },
                        { "letra": "B", "texto": "Alternativa B2" },
                        { "letra": "C", "texto": "Alternativa C2" },
                        { "letra": "D", "texto": "Alternativa D2" }
                      ]
                    }
                  ]
                }
                """;
    }

    public String gerarJsonComZeroAlternativasParaTeste() {
        return """
                {
                  "questoes": [
                    {
                      "enunciado": "Questão sem alternativas",
                      "gabarito": "A",
                      "pontuacao": 1.0,
                      "ordem": 1,
                      "alternativas": []
                    }
                  ]
                }
                """;
    }

    public String gerarJsonFlashcardsValidoParaTeste(int quantidade) {
        StringBuilder json = new StringBuilder();
        json.append("{\"flashcards\":[");

        for (int i = 1; i <= quantidade; i++) {
            if (i > 1) {
                json.append(',');
            }

            json.append("{\"textoFrente\":\"Frente ").append(i)
                    .append("\",\"textoVerso\":\"Verso ").append(i)
                    .append("\"}");
        }

        json.append("]}");
        return json.toString();
    }

    public String gerarJsonFlashcardsComTextoFrenteVazioParaTeste() {
        return """
                {
                  "flashcards": [
                    {
                      "textoFrente": " ",
                      "textoVerso": "Verso valido"
                    }
                  ]
                }
                """;
    }
}
