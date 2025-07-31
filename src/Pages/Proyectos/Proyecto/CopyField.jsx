import { ClipboardCopy } from "lucide-react";

export default function CopyField({ textAreaRef, copyTextToClipboard, vehiculos}) {
    return (
        <div>
            <h3 className="title-3 mt-5 mb-2 ">
                Económicos en serie (para copiar y pegar)
            </h3>
            <div className="relative">
                <textarea
                    ref={textAreaRef}
                    className="mt-2"
                    value={vehiculos.map((v) => v.eco).join(", ")}
                    // ref={(textarea) => (this.textArea = textarea)}
                    readOnly
                />
                <button
                    className="absolute top-1 right-2 bg-white border border-gray-300 rounded-md p-1 h-fit"
                    onClick={copyTextToClipboard}
                >
                    <ClipboardCopy className="text-gray-500" />
                </button>
            </div>
        </div>
    );
}
