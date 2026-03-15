const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
);

const MemberTable = ({ members, onView }) => {
  if (!members || members.length === 0) {
    return (
      <div className="w-full py-12 text-center text-gray-400 bg-gray-900/50 rounded-xl border border-gray-800">
        <p>No members found.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-6 my-4 overflow-x-auto">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900/60 backdrop-blur-sm shadow-xl">
     
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/80">
              <tr>
                <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  S.No.
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Profession
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Verified
                </th>
                <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
               
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-900/40">
              {members.map((member, index) => (
                <tr
                  key={member._id}
                  onClick={() => onView(member)}
                  className="hover:bg-gray-800/60 transition-colors duration-200 cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
                      {member.fullName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">{member.profession}</div>
                  </td>

                  {/* Verified Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.isVerified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50">
                        <CheckCircleIcon /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-800 text-orange-400 border border-orange-700">
                        <XCircleIcon /> No
                      </span>
                    )}
                  </td>

                  {/* Active Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.status === "active" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50">
                        <ActivityIcon /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-500 border border-gray-700">
                        Inactive
                      </span>
                    )}
                  </td>              
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberTable;