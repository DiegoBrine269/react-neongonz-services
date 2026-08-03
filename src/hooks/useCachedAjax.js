// hooks/useCachedAjax.js
import { useCallback } from "react";
import axios from "axios";
import { useTableCacheStore } from "@/stores/useTableCacheStore";

/**
 * @param {string} resourceName - nombre único del recurso, ej. "invoices", "vehicles", "centres"
 * @param {string} token - bearer token
 */
export function useCachedAjax(resourceName, token) {
    const getCached = useTableCacheStore((s) => s.getCached);
    const setCached = useTableCacheStore((s) => s.setCached);

    const ajaxRequestFunc = useCallback(
        async (url, config, params) => {
            const cacheKey = `${resourceName}:${JSON.stringify(params)}`;
            const cached = getCached(cacheKey);
            if (cached) return cached;

            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            setCached(cacheKey, data);
            return data;
        },
        [resourceName, token, getCached, setCached],
    );

    return ajaxRequestFunc;
}
