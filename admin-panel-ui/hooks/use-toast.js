'use client';
// Inspired by react-hot-toast library
import * as React from 'react';
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: 'ADD_TOAST',
    UPDATE_TOAST: 'UPDATE_TOAST',
    DISMISS_TOAST: 'DISMISS_TOAST',
    REMOVE_TOAST: 'REMOVE_TOAST',
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId) => {
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId);
        dispatch({
            type: 'REMOVE_TOAST',
            toastId: toastId,
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
export const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TOAST':
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            };
        case 'UPDATE_TOAST':
            return {
                ...state,
                toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t),
            };
        case 'DISMISS_TOAST': {
            const { toastId } = action;
            // ! Side effects ! - This could be extracted into a dismissToast() action,
            // but I'll keep it here for simplicity
            if (toastId) {
                addToRemoveQueue(toastId);
            }
            else {
                state.toasts.forEach((toast) => {
                    addToRemoveQueue(toast.id);
                });
            }
            return {
                ...state,
                toasts: state.toasts.map((t) => t.id === toastId || toastId === undefined
                    ? {
                        ...t,
                        open: false,
                    }
                    : t),
            };
        }
        case 'REMOVE_TOAST':
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: [],
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            };
    }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener) => {
        listener(memoryState);
    });
}
function formatErrorDescription(error, fallbackMessage) {
    if (!error) return fallbackMessage || "Something went wrong";
    
    const apiErrors = error.errors || error.data?.errors || error.response?.data?.errors;
    const message = error.message || error.data?.message || fallbackMessage || "Something went wrong";
    
    if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        return React.createElement("div", { className: "space-y-1 mt-1 text-xs" },
            React.createElement("p", { className: "font-semibold text-sm" }, message),
            React.createElement("ul", { className: "list-disc pl-4 space-y-0.5" },
                apiErrors.map((e, idx) => {
                    const rawField = e.field || "";
                    const cleanField = rawField.replace(/^(body\.|query\.|params\.)/, '');
                    const formattedField = cleanField
                        ? cleanField
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())
                        : "";
                    return React.createElement("li", { key: idx },
                        formattedField ? React.createElement("span", { className: "font-semibold" }, `${formattedField}: `) : null,
                        React.createElement("span", null, e.message)
                    );
                })
            )
        );
    }
    
    return message;
}

function toast({ ...props }) {
    const id = genId();
    
    let description = props.description;
    const error = props.error || (props.description instanceof Error || (props.description && typeof props.description === 'object' && ('message' in props.description || 'errors' in props.description || 'data' in props.description)) ? props.description : null);
    
    if (error) {
        description = formatErrorDescription(error, typeof props.description === 'string' ? props.description : null);
    }

    const update = (props) => dispatch({
        type: 'UPDATE_TOAST',
        toast: { ...props, id },
    });
    const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });
    dispatch({
        type: 'ADD_TOAST',
        toast: {
            ...props,
            description,
            id,
            open: true,
            onOpenChange: (open) => {
                if (!open)
                    dismiss();
            },
        },
    });
    return {
        id: id,
        dismiss,
        update,
    };
}
function useToast() {
    const [state, setState] = React.useState(memoryState);
    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [state]);
    return {
        ...state,
        toast,
        dismiss: (toastId) => dispatch({ type: 'DISMISS_TOAST', toastId }),
    };
}
export { useToast, toast };
