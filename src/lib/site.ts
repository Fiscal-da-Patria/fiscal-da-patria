/**
 * Domínio público canônico do projeto (fonte única).
 * Sem barra final: os deep links montam `SITE_URL + "/?"`.
 */
export const SITE_URL = "https://fiscaldapatria.org";

/** Host exibido nos cartões compartilháveis (sem protocolo). */
export const SITE_HOST = new URL(SITE_URL).host;