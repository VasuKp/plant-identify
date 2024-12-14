interface PlantInfoProps {
  plantData: {
    commonName?: string;
    scientificName?: string;
    description?: string;
    careInstructions?: string;
    idealConditions?: string;
  } | null;
}

export default function PlantInfo({ plantData }: PlantInfoProps) {
  if (!plantData) return null;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#fff9ed] rounded-xl shadow-lg border border-[#e6d5bc]">
      <h2 className="text-3xl font-bold mb-8 text-[#22c55e]">Plant Information</h2>
      
      {/* Description Section */}
      <div className="mb-8 bg-[#fffbf4] p-6 rounded-lg border border-[#e6d5bc]">
        <h3 className="text-xl font-semibold text-[#22c55e] mb-3">Description</h3>
        <p className="text-gray-700 leading-relaxed">
          {plantData.description}
        </p>
      </div>

      {/* Plant Details Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[#22c55e] mb-4">Plant Details</h3>
        <div className="overflow-x-auto rounded-lg border border-[#e6d5bc]">
          <table className="w-full border-collapse bg-[#fffbf4]">
            <thead>
              <tr className="bg-[#fff9ed]">
                <th className="w-1/4 text-left p-4 font-semibold text-[#22c55e] border-b border-[#e6d5bc]">
                  Attribute
                </th>
                <th className="w-3/4 text-left p-4 font-semibold text-[#22c55e] border-b border-[#e6d5bc]">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-[#fff9ed] transition-colors">
                <td className="p-4 border-b border-[#e6d5bc] font-medium text-gray-700">
                  Common Name
                </td>
                <td className="p-4 border-b border-[#e6d5bc] text-gray-600">
                  {plantData.commonName}
                </td>
              </tr>
              <tr className="hover:bg-[#fff9ed] transition-colors">
                <td className="p-4 border-b border-[#e6d5bc] font-medium text-gray-700">
                  Scientific Name
                </td>
                <td className="p-4 border-b border-[#e6d5bc] text-gray-600 italic">
                  {plantData.scientificName}
                </td>
              </tr>
              <tr className="hover:bg-[#fff9ed] transition-colors">
                <td className="p-4 border-b border-[#e6d5bc] font-medium text-gray-700">
                  Care Instructions
                </td>
                <td className="p-4 border-b border-[#e6d5bc] text-gray-600">
                  {plantData.careInstructions}
                </td>
              </tr>
              <tr className="hover:bg-[#fff9ed] transition-colors">
                <td className="p-4 border-b border-[#e6d5bc] font-medium text-gray-700">
                  Ideal Conditions
                </td>
                <td className="p-4 border-b border-[#e6d5bc] text-gray-600">
                  {plantData.idealConditions}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}