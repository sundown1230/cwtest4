const mockDoctors = {
    '1': {
        id: 1,
        name: '山田太郎',
        gender: 'M',
        birthdate: '1980-01-01',
        license_date: '2005-04-01',
        email: 'yamada@example.com',
        specialties: ['内科', '消化器科']
    }
};
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};
// src/workers/doctors.ts
export default {
    async fetch(request, env, ctx) {
        // OPTIONSリクエストの処理
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders
            });
        }
        // API_KEYの検証
        const apiKey = request.headers.get('X-API-Key');
        console.log('Received API Key:', apiKey);
        console.log('Expected API Key:', env.API_KEY);
        if (apiKey !== env.API_KEY) {
            return new Response(JSON.stringify({
                success: false,
                error: '認証エラー'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        const url = new URL(request.url);
        const path = url.pathname;
        const id = path.split('/').pop();
        if (!id || !mockDoctors[id]) {
            return new Response(JSON.stringify({
                success: false,
                error: '医師情報が見つかりませんでした'
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        return new Response(JSON.stringify({
            success: true,
            data: mockDoctors[id]
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};
