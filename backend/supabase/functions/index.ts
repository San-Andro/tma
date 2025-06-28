import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import {handleTestRoute} from "./routes/api/v1/test.ts";
import { decode } from "https://deno.land/std@0.192.0/encoding/base64url.ts";
import { load } from "https://deno.land/std@0.200.0/dotenv/mod.ts";


// подключил переменное окружение
const env = await load({
    envPath: `../../.env`,
    export: true
})

const TOKEN = Deno.env.get("TOKEN");
const encoder = new TextEncoder();

// логика авторизации

//функция чтобы протестировать, чтоб запустить надо удалить главную функцию
// async function validateInitData(initData: string) {
//     if (initData.includes("test_skip_auth")) return true;
// }


//я проверял все работает, лично проверено


async function validateInitData(initData: string): Promise<boolean> {
    try {
        //тут мы получаем хэш
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get("hash");
        if (!hash) return false;

        //тута сортируем данные

        const dataCheckString = Array.from(urlParams.entries())
            .filter(([key]) => key !== "hash")
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");

        //тут создаем ключ на основе метода шифрования

        const secretKey = await crypto.subtle.importKey(
            "raw",
            encoder.encode("WebAppData"),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );

        const hmacKey = await crypto.subtle.sign(
            "HMAC",
            secretKey,
            encoder.encode(TOKEN)
        )

        const verificationKey = await crypto.subtle.importKey(
            "raw",
            new Uint8Array(hmacKey),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );

        //здесь уже проверяем сами подписи

        return await crypto.subtle.verify(
            "HMAC",
            verificationKey,
            decode(hash),
            encoder.encode(dataCheckString)
        );
    } catch (error) {
        console.error(error);
        return false;
    }
}

// уже сам роутинг
// я хотел сделать логику авторицации в другом файле, но предполагаю структура будет меняться, поэтому все в один сделал

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url);


    if (url.pathname === "/api/v1/test") {

        const initData = url.searchParams.get("tgWebAppInitData") ||
            req.headers.get("X-Telegram-Init-Data");

        if (!initData || !(await validateInitData(initData))) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }


        return handleTestRoute(req);
    }


    return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
    });
}

serve(handler);