import { FingerprintIcon } from "../icons/icons";
import { Button } from "./button";

type ModalProps = {
  setIsModalOpen: (isOpen: boolean) => void;
};

export const Modal = ({ setIsModalOpen }: ModalProps) => {
  return (
    <div>
      <div className="fixed inset-0 bg-black/50 z-50"></div>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-background p-6 rounded-lg shadow-lg w-96 flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold mb-4">Scan Fingerprint</h2>
          <div className="text-text relative group bg-primary flex w-fit p-4 rounded-full shadow-lg">
            <FingerprintIcon width={200} height={200} />
          </div>
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </div>
      </div>
    </div>
  );
};
