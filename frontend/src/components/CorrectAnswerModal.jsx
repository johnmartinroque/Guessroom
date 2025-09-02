import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function CorrectAnswerModal({ show, onClose, song }) {
  if (!song) return null;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Round Over!</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <img
          src={song.albumArt}
          alt={song.title}
          style={{ width: "150px", marginBottom: "10px" }}
          rrf
        />
        <h5>{song.title}</h5>
        <p>{song.artist}</p>
      </Modal.Body>
    </Modal>
  );
}

export default CorrectAnswerModal;
