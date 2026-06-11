import showToast from '../components/ui/Toast';

export const useToast = () => {
  return {
    success: (msg) => showToast.success(msg),
    error: (msg) => showToast.error(msg),
    info: (msg) => showToast.info(msg),
    warning: (msg) => showToast.info(msg) // map warning to info glass theme style
  };
};

export default useToast;
