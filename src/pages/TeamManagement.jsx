// frontend/src/pages/TeamManagement.jsx
// ✅ UPDATED: Buttons show as disabled with tooltips instead of hidden

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';
import { Users, Mail, Trash2, Shield, UserPlus, CheckCircle, Clock, XCircle, Crown } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamManagement = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // ✅ Debug: Log user permissions
  useEffect(() => {
    console.log('👤 Current user:', user);
    console.log('🔐 Permissions:', user?.permissions);
  }, [user]);
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user'
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await axiosInstance.get('/team/members');
      setTeamMembers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);

    try {
      const response = await axiosInstance.post('/team/invite', inviteForm);
      
      toast.success(`Invitation sent to ${inviteForm.email}!`);
      
      setInviteForm({
        email: '',
        firstName: '',
        lastName: '',
        role: 'user'
      });
      
      setShowInviteModal(false);
      fetchTeamMembers();
      
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send invitation';
      toast.error(errorMsg);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from the team?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/team/members/${userId}`);
      toast.success(`${userName} has been removed from the team`);
      fetchTeamMembers();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to remove team member';
      toast.error(errorMsg);
    }
  };

  const getRoleBadge = (role, isOwner) => {
    if (isOwner) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Crown className="w-3 h-3" />
          Owner
        </span>
      );
    }

    const roleColors = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      user: 'bg-gray-100 text-gray-800',
      accountant: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleColors[role] || roleColors.user}`}>
        <Shield className="w-3 h-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }
  };

  const activeMembers = teamMembers.filter(m => m.isActive).length;
  const pendingMembers = teamMembers.filter(m => !m.isActive).length;
  const maxUsers = user?.organization?.maxUsers || 5;
  const availableSeats = maxUsers - activeMembers;
  
  // ✅ Check if user can manage team
  const canManageUsers = user?.permissions?.canManageUsers || user?.isOwner || false;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Management</h1>
        <p className="text-gray-600">Manage your team members and their access</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeMembers}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{pendingMembers}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Seats</p>
              <p className="text-2xl font-bold text-purple-600">{availableSeats}</p>
            </div>
            <UserPlus className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* License Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">
              Using {activeMembers} of {maxUsers} user licenses
            </p>
            <div className="w-64 bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(activeMembers / maxUsers) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* ✅ UPDATED: Show button but disable if no permission */}
          {availableSeats > 0 ? (
            <div className="relative group">
              <button
                onClick={() => canManageUsers && setShowInviteModal(true)}
                disabled={!canManageUsers}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  canManageUsers
                    ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer shadow-sm hover:shadow'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Invite Team Member
              </button>
              {!canManageUsers && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg">
                    Only owners and admins can invite team members
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-orange-600 font-medium">
              No available seats. Upgrade your plan to add more users.
            </div>
          )}
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No team members yet</p>
                    <p className="text-sm">Invite your first team member to get started</p>
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.isOwner ? 'Account Owner' : 'Team Member'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{member.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(member.role, member.isOwner)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(member.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* ✅ UPDATED: Show disabled remove button with tooltip */}
                      {!member.isOwner && member._id !== user?.id ? (
                        <div className="relative group inline-block">
                          <button
                            onClick={() => canManageUsers && handleRemoveMember(member._id, `${member.firstName} ${member.lastName}`)}
                            disabled={!canManageUsers}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded transition-all ${
                              canManageUsers
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer'
                                : 'text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                          {!canManageUsers && (
                            <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap shadow-lg">
                                Only owners and admins can remove members
                                <div className="absolute top-full right-4 transform -mt-1">
                                  <div className="border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : member.isOwner ? (
                        <span className="text-gray-400 text-xs">Owner</span>
                      ) : (
                        <span className="text-gray-400 text-xs">You</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="colleague@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="user">User - Basic access</option>
                  <option value="manager">Manager - Team management</option>
                  <option value="admin">Admin - Full access (except billing)</option>
                  <option value="accountant">Accountant - Financial access</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  💡 An invitation email will be sent to <strong>{inviteForm.email || 'the email address'}</strong>. They'll be able to set their own password.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;