package br.com.ilumina.service.Llm;

import br.com.ilumina.config.LlmProperties;
import br.com.ilumina.exception.LlmUnavailableException;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
@Profile("!test")
public class LlmServiceImpl implements LlmService {

    private final LlmProperties props;

    public LlmServiceImpl(LlmProperties props) {
        this.props = props;
    }

    @Override
    public String gerarQuestoes(String prompt, int quantidadeEsperada) {
        if (props.getApiKey() == null || props.getApiKey().isBlank()) {
            throw new LlmUnavailableException(
                    "A configuração da API de IA não foi encontrada. Defina GOOGLE_API_KEY (ou GEMINI_API_KEY) no ambiente ou no arquivo .env."
            );
        }

        GenerateContentConfig config = GenerateContentConfig.builder()
                .responseMimeType("application/json")
                .maxOutputTokens(props.getMaxOutputTokens())
                .build();

        try {
            GenerateContentResponse response = CompletableFuture
                    .supplyAsync(() -> createClient().models.generateContent(props.getModel(), prompt, config))
                    .orTimeout(props.getTimeoutSeconds(), TimeUnit.SECONDS)
                    .join();

            String text = response != null ? response.text() : null;
            if (text == null || text.isBlank()) {
                throw new LlmUnavailableException("A IA retornou uma resposta vazia. Tente novamente.");
            }

            return text;
        } catch (CompletionException ex) {
            Throwable cause = ex.getCause();

            if (cause instanceof TimeoutException) {
                throw new LlmUnavailableException(
                        "A geração de questões demorou mais que o esperado. Tente novamente.",
                        cause
                );
            }

            if (cause instanceof LlmUnavailableException llmUnavailableException) {
                throw llmUnavailableException;
            }

            throw new LlmUnavailableException(
                    "Não foi possível gerar questões com IA no momento. Tente novamente.",
                    cause != null ? cause : ex
            );
        } catch (LlmUnavailableException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new LlmUnavailableException(
                    "Não foi possível gerar questões com IA no momento. Tente novamente.",
                    ex
            );
        }
    }

    private Client createClient() {
        return Client.builder()
                .apiKey(props.getApiKey().trim())
                .build();
    }
}
