exports.handler = async (event, context) => {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appI8MMDBzZwzLojc";

  if (!AIRTABLE_TOKEN) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "AIRTABLE_TOKEN no configurado en Netlify" }),
    };
  }

  // Obtener la tabla desde la URL o usar 'Parametro' por defecto si no se especifica
  const queryParams = event.queryStringParameters || {};
  const table = queryParams.table || "Parametro";
  
  delete queryParams.table; // Eliminar para no duplicar en la URL de Airtable

  let url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`;
  const searchParams = new URLSearchParams(queryParams);
  if (searchParams.toString()) {
    url += `?${searchParams.toString()}`;
  }

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: event.body ? event.body : undefined,
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
