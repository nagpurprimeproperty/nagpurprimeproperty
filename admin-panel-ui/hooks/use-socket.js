"use client"

import { useEffect, useRef, useCallback, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "@/lib/store/auth-store";
const getSocketUrl = () => {
    if (typeof window !== "undefined") {
        return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};
const SOCKET_URL = getSocketUrl();
const isDev = process.env.NODE_ENV === "development";
export function useSocket(namespace = "/admin", adminId) {
    const [socket, setSocket] = useState(null);
    const handlersRef = useRef(new Map());
    const token = useAuthStore((s) => s.token);
    useEffect(() => {
        if (!token)
            return;
        const s = io(`${SOCKET_URL}${namespace}`, {
            path: "/api/socket",
            auth: { token },
            transports: ["websocket", "polling"],
        });
        s.on("connect", () => {
            if (isDev)
                console.log("[Socket] Connected:", s.id);
            if (adminId) {
                s.emit("join", { adminId });
            }
            // Clear old handlers and re-attach onto the new socket
            handlersRef.current.forEach((handlers, event) => {
                handlers.forEach((handler) => s.off(event, handler));
            });
            handlersRef.current.forEach((handlers, event) => {
                handlers.forEach((handler) => s.on(event, handler));
            });
        });
        s.on("connect_error", (err) => {
            if (isDev)
                console.error("[Socket] Connection error:", err.message);
            // Attempt reconnect after a short delay
            setTimeout(() => {
                if (!s.connected)
                    s.connect();
            }, 3000);
        });
        s.on("disconnect", (reason) => {
            if (isDev)
                console.log("[Socket] Disconnected:", reason);
        });
        setSocket(s);
        return () => {
            s.disconnect();
            setSocket(null);
        };
    }, [token, namespace, adminId]);
    const emit = useCallback((event, data) => {
        socket?.emit(event, data);
    }, [socket]);
    const on = useCallback((event, handler) => {
        // Register handler in registry for reconnection replay
        if (!handlersRef.current.has(event)) {
            handlersRef.current.set(event, new Set());
        }
        handlersRef.current.get(event).add(handler);
        // Attach to current socket if available
        socket?.on(event, handler);
        return () => {
            handlersRef.current.get(event)?.delete(handler);
            socket?.off(event, handler);
        };
    }, [socket]);
    return { socket, emit, on };
}
