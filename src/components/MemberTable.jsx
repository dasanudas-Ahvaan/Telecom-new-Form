import { ActivityIcon, CheckCircleIcon, XCircleIcon } from "./icons";


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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-700 text-red-100 border border-red-700">
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