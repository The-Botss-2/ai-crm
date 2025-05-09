export const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'contacted': return 'bg-indigo-100 text-indigo-800';
    case 'qualified': return 'bg-yellow-100 text-yellow-800';
    case 'proposal': return 'bg-purple-100 text-purple-800';
    case 'negotiation': return 'bg-orange-100 text-orange-800';
    case 'closed_won': return 'bg-green-100 text-green-800';
    case 'closed_lost': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
