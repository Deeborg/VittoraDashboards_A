import { motion } from 'framer-motion';
import ExceptionTable from '../components/ExceptionTable';

export default function ExceptionDetails() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div>
                <h1 className="text-xl font-heading font-bold text-gray-800">Exception Details</h1>
                <p className="text-xs text-gray-500 mt-0.5">Complete exception analysis with drill-down filtering</p>
            </div>

            <ExceptionTable />
        </motion.div>
    );
}
