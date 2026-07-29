import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";

function NfcPage() {
  const { slug } = useParams();

  const decoded = useMemo(() => {
    try {
      return decodeURIComponent(slug || "");
    } catch {
      return slug || "";
    }
  }, [slug]);

  return (
    <section className="panel">
      <h2>Entrada NFC detectada</h2>
      <p>
        El tag NDEF te ha traido al articulo: <strong>{decoded}</strong>
      </p>
      <p>
        Proximo paso: resolver este slug contra la base de datos y anadir
        automaticamente el articulo a la lista activa.
      </p>
      <Link to="/lista" className="btn">
        Ir a la lista
      </Link>
    </section>
  );
}

export default NfcPage;
