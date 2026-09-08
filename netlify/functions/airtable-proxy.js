exports.handler = async (event) => {
  // 1. Manejo de peticiones CORS pre-flight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  // 2. Credenciales y constantes
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || "appI8MMDBzZwzLojc";
  
  // 3. Extracción de parámetros y tabla destino
  const params = event.queryStringParameters || {};
  const tableName = params.table || "Parametro";

  // 4. Limpieza de la URL para la API de Airtable
  const searchParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (key !== "table") searchParams.append(key, params[key]);
  });

  const queryString = searchParams.toString();
  const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}${queryString ? '?' + queryString : ''}`;

  try {
    // 5. Petición directa a Airtable con token limpio (.trim)
    const response = await fetch(airtableUrl, {
      method: event.httpMethod,
      headers: {
        "Authorization": `Bearer ${token ? token.trim() : ''}`,
        "Content-Type": "application/json",
      },
      body: event.body || undefined,
    });

    const responseData = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: responseData,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
