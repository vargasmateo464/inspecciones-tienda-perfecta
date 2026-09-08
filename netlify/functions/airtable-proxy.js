exports.handler = async (event, context) => {
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || "appI8MMDBzZwzLojc";

  if (!AIRTABLE_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "AIRTABLE_TOKEN no configurado en Netlify" }),
    };
  }

  const { table, ...queryParams } = event.queryStringParameters || {};

  if (!table) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta el parámetro 'table'" }),
    };
  }

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
      body: event.httpMethod !== "GET" ? event.body : undefined,
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
