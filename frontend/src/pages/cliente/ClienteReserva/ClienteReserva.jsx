import ReservaWizard from "../../../components/ReservaWizard/ReservaWizard";
import "./ClienteReserva.css";

export default function ClienteReserva() {
  return (
    <div>
      <div className="cliente-reserva-header">
        <h1>Reservar un <span>Turno</span></h1>
      </div>
      <ReservaWizard />
    </div>
  );
}
