import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageCircle,
  Trash2,
  Edit3,
  Check,
  X,
  Archive,
  Search,
  Clock,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import { toast } from "react-hot-toast";

const ImprovedChatManager = ({
  chats,
  activeChat,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onRenameChat,
  onArchiveChat,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingChat, setEditingChat] = useState(null);
  const [newChatName, setNewChatName] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // Filter chats based on search and archive status
  const filteredChats = chats
    .filter(chat => {
      if (!showArchived && chat.archived) return false;
      if (showArchived && !chat.archived) return false;
      return chat.title.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(b.lastUsedAt) - new Date(a.lastUsedAt));

  const handleCreateChat = () => {
    const now = new Date();
    const defaultName = `محادثة جديدة - ${now.toLocaleDateString("ar")}`;
    onCreateChat(defaultName);
    toast.success("تم إنشاء محادثة جديدة");
  };

  const handleRename = (chatId, newName) => {
    if (newName.trim()) {
      onRenameChat(chatId, newName.trim());
      setEditingChat(null);
      setNewChatName("");
      toast.success("تم تغيير اسم المحادثة");
    }
  };

  const handleDelete = (chatId, chatTitle) => {
    if (window.confirm(`هل تريد حذف "${chatTitle}"؟`)) {
      onDeleteChat(chatId);
      toast.success("تم حذف المحادثة");
      setOpenMenus({});
    }
  };

  const handleArchive = (chatId, isArchived) => {
    onArchiveChat(chatId, !isArchived);
    toast.success(isArchived ? "تم إلغاء الأرشفة" : "تم الأرشفة");
    setOpenMenus({});
  };

  const formatLastUsed = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
    
    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes}د`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)}س`;
    if (diffInMinutes < 10080) return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
    return new Date(date).toLocaleDateString("ar");
  };

  const getMessagePreview = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return "لا توجد رسائل";
    const lastMessage = chat.messages[chat.messages.length - 1];
    const preview = lastMessage.message.length > 40 
      ? lastMessage.message.substring(0, 40) + "..."
      : lastMessage.message;
    return preview;
  };

  const toggleMenu = (chatId) => {
    setOpenMenus(prev => ({
      ...prev,
      [chatId]: !prev[chatId]
    }));
  };

  const closeMenus = () => {
    setOpenMenus({});
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">المحادثات</h2>
              <p className="text-sm text-gray-600">{filteredChats.length} محادثة</p>
            </div>
          </div>
          
          <EnhancedButton
            onClick={handleCreateChat}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            جديدة
          </EnhancedButton>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="بحث في المحادثات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Archive Toggle */}
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 text-sm rounded-lg transition-all ${
              showArchived
                ? "bg-gray-700 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {showArchived ? "عرض النشطة" : "عرض المؤرشفة"}
          </button>
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm ? "لا توجد نتائج" : showArchived ? "لا توجد محادثات مؤرشفة" : "لا توجد محادثات"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "جرب البحث بكلمات أخرى" : "ابدأ محادثة جديدة للبدء"}
            </p>
            {!searchTerm && (
              <EnhancedButton
                onClick={handleCreateChat}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                إنشاء محادثة جديدة
              </EnhancedButton>
            )}
          </div>
        ) : (
          <div className="p-2">
            <AnimatePresence>
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative mb-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    activeChat?.id === chat.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    if (editingChat !== chat.id) {
                      onSelectChat(chat);
                      closeMenus();
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {editingChat === chat.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newChatName}
                            onChange={(e) => setNewChatName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleRename(chat.id, newChatName);
                              }
                            }}
                            className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(chat.id, newChatName);
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChat(null);
                              setNewChatName("");
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 truncate text-sm">
                              {chat.title}
                            </h3>
                            {chat.archived && (
                              <Archive className="w-4 h-4 text-gray-400" />
                            )}
                            {activeChat?.id === chat.id && (
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate mb-2">
                            {getMessagePreview(chat)}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{chat.messageCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatLastUsed(chat.lastUsedAt)}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {editingChat !== chat.id && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(chat.id);
                          }}
                          className="p-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {openMenus[chat.id] && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                            >
                              <div className="p-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingChat(chat.id);
                                    setNewChatName(chat.title);
                                    closeMenus();
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  إعادة تسمية
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchive(chat.id, chat.archived);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <Archive className="w-4 h-4" />
                                  {chat.archived ? "إلغاء الأرشفة" : "أرشفة"}
                                </button>
                                
                                <hr className="my-1" />
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(chat.id, chat.title);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  حذف
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Active indicator */}
                  {activeChat?.id === chat.id && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 rounded-r-lg"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Close Button for Mobile */}
      <div className="p-4 border-t border-gray-200 lg:hidden">
        <EnhancedButton
          onClick={onClose}
          variant="outline"
          className="w-full"
        >
          <ChevronRight className="w-4 h-4 mr-2" />
          العودة للمحادثة
        </EnhancedButton>
      </div>
    </div>
  );
};

export default ImprovedChatManager; 