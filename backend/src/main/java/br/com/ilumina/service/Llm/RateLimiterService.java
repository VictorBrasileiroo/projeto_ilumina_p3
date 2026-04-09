package br.com.ilumina.service.Llm;

import br.com.ilumina.config.LlmProperties;
import br.com.ilumina.exception.RateLimitExceededException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private final ConcurrentHashMap<String, Deque<Instant>> requisicoesPorChave = new ConcurrentHashMap<>();
    private final Duration janela = Duration.ofMinutes(1);
    private final int limitePorMinuto;

    public RateLimiterService(LlmProperties llmProperties) {
        this.limitePorMinuto = Math.max(1, llmProperties.getRateLimitPerMinute());
    }

    public void validarLimiteOuLancar(String chaveConsumidor) {
        String chaveNormalizada = normalizarChave(chaveConsumidor);
        Instant agora = Instant.now();

        Deque<Instant> historico = requisicoesPorChave.computeIfAbsent(chaveNormalizada, key -> new ArrayDeque<>());

        synchronized (historico) {
            Instant limiteInferior = agora.minus(janela);
            while (!historico.isEmpty() && historico.peekFirst().isBefore(limiteInferior)) {
                historico.pollFirst();
            }

            if (historico.size() >= limitePorMinuto) {
                Instant primeiraRequisicao = historico.peekFirst();
                long retryAfter = calcularRetryAfter(agora, primeiraRequisicao);
                throw new RateLimitExceededException(
                        "Limite de geração excedido. Tente novamente em " + retryAfter + " segundos."
                );
            }

            historico.addLast(agora);
        }
    }

    public void resetForTests() {
        requisicoesPorChave.clear();
    }

    private long calcularRetryAfter(Instant agora, Instant primeiraRequisicao) {
        if (primeiraRequisicao == null) {
            return 60;
        }

        long segundos = Duration.between(agora, primeiraRequisicao.plus(janela)).getSeconds();
        return Math.max(1, segundos);
    }

    private String normalizarChave(String chaveConsumidor) {
        if (chaveConsumidor == null || chaveConsumidor.isBlank()) {
            return "unknown";
        }

        return chaveConsumidor.trim().toLowerCase(Locale.ROOT);
    }
}
