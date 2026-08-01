import { useCallback, useState } from "react";
import { toast } from "react-toastify";

export function useDoubleConfirmAction({ actionFn, onSuccess, onError }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmToken, setConfirmToken] = useState(null);

  const handleResponse = useCallback(
    (data) => {
      if (data?.requiresConfirmation) {
        setMessage(data.message || "Are you sure you want to proceed?");
        setConfirmToken(data.confirmToken);
        setOpen(true);
        return false; // still pending, not executed yet
      }
      return true; // already executed (non-sensitive action)
    },
    []
  );

  const trigger = useCallback(async () => {
    try {
      setLoading(true);
      const res = await actionFn();
      const executed = handleResponse(res.data.data, res.data.message);
      if (executed) {
        onSuccess?.(res.data);
      } else {
        setMessage(res.data.message || "Are you sure you want to proceed?");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "An error occurred, please try again";
      toast.error(msg);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [actionFn, handleResponse, onSuccess, onError]);

  const confirm = useCallback(async () => {
    try {
      setLoading(true);
      const res = await actionFn(confirmToken);
      setOpen(false);
      toast.success(res.data.message || "Operation completed successfully");
      onSuccess?.(res.data);
    } catch (err) {
      const msg = err?.response?.data?.message || "An error occurred, please try again";
      toast.error(msg);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [actionFn, confirmToken, onSuccess, onError]);

  const cancel = useCallback(() => {
    setOpen(false);
    setConfirmToken(null);
  }, []);

  return {
    trigger,
    dialogProps: {
      open,
      message,
      loading,
      onConfirm: confirm,
      onCancel: cancel,
    },
  };
}
