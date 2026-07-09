import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Save, CheckCircle } from 'lucide-react';
import { SelectInput, TextInput } from '../../components/widgets/FilterField';

interface ChargeRow {
    id: string;
    organization: string;
    vessel: string;
    voyageNo: string;
    charge: string;
    description: string;
    jobNo: string;
    shipmentNo: string;
    currency: string;
    exRate: string;
    fcyAmount: string;
    amountAed: string;
}

export default function BulkCostEntryPage() {
    const navigate = useNavigate();
    const [charges, setCharges] = useState<ChargeRow[]>([]);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center overflow-y-auto py-6 z-50">
            <div className="bg-white rounded-md shadow-lg w-full max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                    <h1 className="text-[17px] font-medium text-gray-800">Cost Entry</h1>
                    <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                </div>

                {/* Form fields */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-3">
                    <div className="md:col-span-4 flex items-start gap-3">
                        <label className="w-24 shrink-0 text-sm text-gray-700 pt-2 text-right">Organization</label>
                        <div className="w-full max-w-md">
                            <SelectInput options={['-Select-']} />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="w-24 shrink-0 text-sm text-gray-700 pt-2 text-right">Vessel Name</label>
                        <div className="flex-1">
                            <SelectInput options={['-Select-']} />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="text-sm text-gray-700 pt-2">Voyage No.</label>
                        <div className="flex-1">
                            <SelectInput options={['-Select-']} />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="text-sm text-gray-700 pt-2">Job No.</label>
                        <div className="flex-1">
                            <SelectInput options={['-Select-']} />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="text-sm text-gray-700 pt-2">Shipment No.</label>
                        <div className="flex-1">
                            <SelectInput options={['-Select-']} />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="w-24 shrink-0 text-sm text-gray-700 pt-2 text-right">Charge</label>
                        <div className="flex-1">
                            <SelectInput options={['-Select-']} />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="text-sm text-gray-700 pt-2">Description</label>
                        <div className="flex-1">
                            <TextInput />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="text-sm text-gray-700 pt-2">FCY Amount</label>
                        <div className="flex-1">
                            <TextInput />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="text-sm text-gray-700 pt-2">Amount (AED)</label>
                        <div className="flex-1">
                            <TextInput />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="w-24 shrink-0 text-sm text-gray-700 pt-2 text-right">Currency</label>
                        <div className="flex-1">
                            <TextInput />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="text-sm text-gray-700 pt-2">Ex.Rate</label>
                        <div className="flex-1">
                            <TextInput />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="text-sm text-gray-700 pt-2">Prorate Method</label>
                        <div className="flex-1">
                            <SelectInput options={['Chargeable Unit']} />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="text-sm text-gray-700 pt-2">Tax Group Code</label>
                        <div className="flex-1">
                            <SelectInput options={['-Select-']} />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="w-24 shrink-0 text-sm text-gray-700 pt-2 text-right">Sale / Cost</label>
                        <div className="flex-1">
                            <SelectInput options={['Cost', 'Sale']} />
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <label className="text-sm text-gray-700 pt-2">Dr / Cr</label>
                        <div className="flex-1">
                            <SelectInput options={['Dr', 'Cr']} />
                        </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end items-start">
                        <button className="flex items-center gap-1.5 bg-blue-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
                            <Plus size={14} />
                            Add Charge
                        </button>
                    </div>
                </div>

                {/* Charge List section */}
                <div className="bg-teal-500 px-5 py-2.5">
                    <h2 className="text-white text-sm font-medium">Charge List</h2>
                </div>

                <div className="min-h-[220px] flex items-center justify-center">
                    {charges.length === 0 && (
                        <p className="text-sm text-gray-400">No charges added yet</p>
                    )}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 bg-red-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity"
                    >
                        <X size={14} />
                        Cancel
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 bg-blue-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
                            <Save size={14} />
                            Save and New
                        </button>
                        <button className="flex items-center gap-1.5 bg-green-600 hover:opacity-90 text-white text-sm px-4 py-1.5 rounded transition-opacity">
                            <CheckCircle size={14} />
                            Save and Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}