// hooks/useCachedAjax.js
import { useCallback } from "react";
import axios from "axios";
import { useTableCacheStore } from "@/stores/useTableCacheStore";

export function useCachedAjax(resourceName, token, tableRef) {
    const getCached = useTableCacheStore((s) => s.getCached);
    const setCached = useTableCacheStore((s) => s.setCached);

    const ajaxRequestFunc = useCallback(
        async (url, config, params) => {
            const cacheKey = `${resourceName}:${JSON.stringify(params)}`;
            const cached = getCached(cacheKey);

            // función que va por datos frescos y actualiza si hay diferencia
            const revalidate = async () => {
                try {
                    const { data: fresh } = await axios.get(url, {
                        headers: { Authorization: `Bearer ${token}` },
                        params,
                    });

                    const isStale =
                        JSON.stringify(fresh) !== JSON.stringify(cached);
                    setCached(cacheKey, fresh);

                    if (isStale && cached && tableRef?.current) {
                        // actualiza la tabla en silencio, sin loading ni parpadeo
                        tableRef.current.replaceData(fresh.data ?? fresh);
                    }
                } catch (e) {
                    console.error("Error revalidando", resourceName, e);
                }
            };

            if (cached) {
                revalidate(); // dispara en background, no bloquea el return
                return cached; // Tabulator pinta esto de inmediato
            }

            // primera vez, sí esperamos el fetch normal
            const { data } = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            setCached(cacheKey, data);
            return data;
        },
        [resourceName, token, tableRef, getCached, setCached],
    );

    return ajaxRequestFunc;
}
