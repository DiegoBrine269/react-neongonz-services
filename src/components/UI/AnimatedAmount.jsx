import { motion } from "motion/react";


export default function AnimatedAmount({label, keyProp}) {
    return (
        <motion.span
            key={keyProp}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.08, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 10,
            }}
            className="bg-green-700 p-1 rounded-md text-white inline-block"

        >
            {label}
        </motion.span>
    )
}
