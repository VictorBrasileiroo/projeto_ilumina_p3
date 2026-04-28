import { Button } from "./Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface SubmeterProvaDialogProps {
  respondidas: number;
  totalQuestoes: number;
  disabled?: boolean;
  isSubmitting?: boolean;
  onConfirm: () => void;
}

export function SubmeterProvaDialog({
  respondidas,
  totalQuestoes,
  disabled = false,
  isSubmitting = false,
  onConfirm,
}: SubmeterProvaDialogProps) {
  const todasRespondidas = respondidas === totalQuestoes && totalQuestoes > 0;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={disabled || isSubmitting}>
          {isSubmitting ? "Enviando..." : "Finalizar Prova"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar prova?</AlertDialogTitle>
          <AlertDialogDescription>
            {todasRespondidas
              ? "Suas respostas serão enviadas para correção. Depois do envio, não será possível responder novamente."
              : `Você respondeu ${respondidas} de ${totalQuestoes} questões. Responda todas as questões antes de enviar.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction
            disabled={!todasRespondidas || isSubmitting}
            onClick={(event) => {
              if (!todasRespondidas) {
                event.preventDefault();
                return;
              }

              onConfirm();
            }}
          >
            Enviar respostas
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
