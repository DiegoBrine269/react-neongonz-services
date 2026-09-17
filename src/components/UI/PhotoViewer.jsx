import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Share from "yet-another-react-lightbox/plugins/share";

export default function PhotoViewer({ lightboxOpen, setLightboxOpen, lightboxIndex, slides }) {

    async function shareAsImage({ slide }) {
        try {
            
            const proxyUrl = `${import.meta.env.VITE_API_URL}/api/photos/proxy?url=${encodeURIComponent(slide.src)}`;
            const response = await fetch(proxyUrl);
            const blob = await response.blob();
            const fileName = slide.src.split("/").pop() || "imagen.jpg";
            const file = new File([blob], fileName, {
                type: blob.type || "image/jpeg",
            });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: slide.title });
            } else {
                await navigator.share({ url: slide.src, title: slide.title });
            }
        } catch (err) {
            console.error("Error al compartir:", err);
        }
    }

    return (
        <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={lightboxIndex}
            slides={slides}
            plugins={[Zoom, Share]}
            controller={{ closeOnBackdropClick: true }}
            share={{ share: shareAsImage }}
        />
    );
}
