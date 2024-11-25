import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <StatusForm />
    </>
  );
}

function StatusForm() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAt = "Carregando...";
  let version = "Carregando...";
  let maxConnections = "Carregando...";
  let openedConnections = "Carregando...";

  if (!isLoading && data) {
    updatedAt = new Date(data.updated_at).toLocaleString("pt-BR");
    version = data.dependencies.database.version;
    maxConnections = data.dependencies.database.max_connections;
    openedConnections = data.dependencies.database.opened_connections;
  }

  return (
    <>
      <div>Última atualização: {updatedAt}</div>
      <div>Versão: {version}</div>
      <div>Máximo de conexões: {maxConnections}</div>
      <div>Conexões abertas: {openedConnections}</div>
    </>
  );
}
