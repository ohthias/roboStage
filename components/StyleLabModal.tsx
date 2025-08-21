type StyleLabModalProps = {
    onClose: () => void;
};

export default function StyleLabModal({onClose}: StyleLabModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="modal modal-open">
                <div className="modal-box">
                    <h2 className="text-lg font-bold mb-4">Criar Tema</h2>
                    <form>
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">Nome do Tema</span>
                            </label>
                            <input type="text" className="input input-bordered" />
                        </div>
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">Descrição</span>
                            </label>
                            <textarea className="textarea textarea-bordered" rows={4}></textarea>
                        </div>
                        <div className="modal-action">
                            <button type="submit" className="btn">Criar</button>
                            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
