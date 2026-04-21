package br.com.ilumina.service.Llm;

public interface LlmService {

    String gerarQuestoes(String prompt, int quantidadeEsperada);

    String gerarFlashcards(String prompt, int quantidadeEsperada);
}
