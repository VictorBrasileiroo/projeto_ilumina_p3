package br.com.ilumina.service.Llm;

public interface LlmService {

    String gerarQuestoes(String prompt, int quantidadeEsperada);
}
