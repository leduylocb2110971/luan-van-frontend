import * as Message from "../components/Message/Message";
export const handleMutationResponse = (
    data,
    {
        onSuccessCallback,
        refetchQuery,
        closeDrawer,
        clearSelection,
        closeModal,
    } = {}
) => {
    if (data?.status === "success") {
        onSuccessCallback?.();
        refetchQuery?.();
        closeDrawer?.();
        clearSelection?.();
        closeModal?.();
        return { success: true, message: data?.message };
    } else {
        return { success: false, message: data?.message };
    }
};