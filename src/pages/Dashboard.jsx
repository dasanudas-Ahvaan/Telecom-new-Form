import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/AuthContext";
import Search from "../components/Search";
import { getAllMembers } from "../api/Admin";
import useDebounce from "../hooks/useDebounce";
import MemberTable from "../components/MemberTable";
import ViewMember from "../components/RightSideBar/ViewMember";
import EditMember from "../components/RightSideBar/EditMember";

const Dashboard = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 800).toLowerCase();
  const { token, user } = useAuth();

  const filteredMembers = debouncedSearch
    ? members.filter(
        (member) =>
          member?.fullName?.toLowerCase().includes(debouncedSearch) ||
          member?.email?.toLowerCase().includes(debouncedSearch)
      )
    : members;

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getAllMembers(token, user?._id);
        if (response.success) setMembers(response.data);
      } catch (error) {
        console.error("Error fetching members:", error.message);
      }
    };

    if (token && user?._id) fetchMembers();
  }, [token, user?._id]);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState({ view: false, member: null });
  const [selectedMember, setSelectedMember] = useState(null);

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedMember(null);
  };

  const handleEditMember = (currentMember) => {
    setIsEditOpen({ view: true, member: currentMember });
  };

  const handleMemberUpdate = (updatedMember) => {
    setMembers((prev) =>
      prev.map((m) => (m._id === updatedMember._id ? updatedMember : m))
    );
  };

  const handleMemberDelete = (deletedMemberId) => {
    setMembers((prev) => prev.filter((m) => m._id !== deletedMemberId));
  };

  return (
    /* 1. Changed bg-green-300 to bg-transparent to show global background
       2. Added padding-top to account for the fixed Navbar */
    <div className="min-h-screen bg-transparent p-4 md:p-8 pt-24">
      
      {/* Container for Search and Actions */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Section with Glass Effect */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-2/3">
            <Search value={search} setSearch={setSearch} />
          </div>
          
          <button
            /* Changed bg-white-200 to a professional Blue/Navy button */
            className="w-full md:w-auto bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95"
            onClick={() => navigate("/dashboard/field")}
          >
            Manage Custom Fields
          </button>
        </div>

        {/* Table Section with Glass Effect */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/40 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-2xl font-bold text-gray-900">Registered Members</h2>
            <p className="text-gray-600 text-sm">View and manage all telecom registrations</p>
          </div>
          
          <div className="overflow-x-auto text-black">
            {filteredMembers && filteredMembers.length > 0 ? (
              <MemberTable members={filteredMembers} onView={handleViewMember} />
            ) : (
              <div className="p-20 text-center text-gray-500 font-medium">
                No members found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      <ViewMember
        isOpen={isViewOpen}
        onClose={handleCloseView}
        member={selectedMember}
        handleEdit={handleEditMember}
      />

      <EditMember
        isOpen={isEditOpen.view}
        onClose={() => setIsEditOpen({ view: false, member: null })}
        member={isEditOpen.member}
        onUpdate={handleMemberUpdate}
        onDelete={handleMemberDelete}
      />
    </div>
  );
};

export default Dashboard;