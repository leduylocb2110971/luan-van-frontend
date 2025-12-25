import axiosClient from '../apis/axiosClient';

export const requestShareThesis = async (thesisId, note, sharingMode) => {
    try {
        const response = await axiosClient.post(`/sharing/request-share-thesis/${thesisId}`, { note, sharingMode });
        return response.data;
    } catch (error) {
        console.error('Error sharing thesis:', error);
        throw error;
    }
};
export const recallShareRequest = async (thesisId) => {
    try {
        const response = await axiosClient.put(`/sharing/recall-share-request/${thesisId}`);
        return response.data;
    } catch (error) {
        console.error('Error recalling share request:', error);
        throw error;
    }
};
export const resubmitShareThesis = async (thesisId, note) => {
    try {
        const response = await axiosClient.post(`/sharing/resubmit-share-thesis/${thesisId}`, { note });
        return response.data;
    } catch (error) {
        console.error('Error resubmitting share thesis:', error);
        throw error;
    }
};

export const getPendingConfirmations = async () => {
    try {
        const response = await axiosClient.get('/sharing/pending-confirmations');
        return response.data;
    }
    catch (error) {
        console.error('Error fetching pending confirmations:', error);
        throw error;
    }
};
export const confirmShareThesis = async (sharingId) => {    
    try {
        const response = await axiosClient.post(`/sharing/confirm-share/${sharingId}`);
        return response.data;
    } catch (error) {
        console.error('Error confirming share thesis:', error);
        throw error;
    }
};
export const rejectShareThesis = async (sharingId, reason) => {
    try {
        const response = await axiosClient.post(`/sharing/reject-share/${sharingId}`, { reason });
        return response.data;
    } catch (error) {
        console.error('Error rejecting share thesis:', error);
        throw error;
    }
};

export const decisionShareThesis = async (sharingId, decision, note) => {
    try {
        const response = await axiosClient.post(`/sharing/decision-share/${sharingId}`, { decision, note });
        return response.data;
    } catch (error) {
        console.error('Error deciding share thesis:', error);
        throw error;
    }
};

//Lấy các xác nhận của một yêu cầu chia sẻ luận văn
export const getConfirmations = async (sharingId) => {
    try {
        const response = await axiosClient.get(`/sharing/get-confirmations/${sharingId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching confirmations:', error);
        throw error;
    }
};
//Lấy các yêu cầu chia sẻ đã được xử lí
export const getAllShareRequest = async () => {
    try {
        const response = await axiosClient.get('/sharing/all-share-requests');
        return response.data;
    } catch (error) {
        console.error('Error fetching all share requests:', error);
        throw error;
    }
};
