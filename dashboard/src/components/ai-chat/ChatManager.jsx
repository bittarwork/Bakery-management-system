import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageCircle,
  Trash2,
  Edit2,
  Check,
  X,
  Archive,
  Star,
  Search,
  Calendar,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "../ui/Card";
import EnhancedButton from "../ui/EnhancedButton";
import { toast } from "react-hot-toast";

const ChatManager = ({
  chats,
  activeChat,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onRenameChat,
  onArchiveChat,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingChat, setEditingChat] = useState(null);
  const [newChatName, setNewChatName] = useState("");
  const [sortBy, setSortBy] = useState("lastUsed"); // lastUsed, created, name
  const [showArchived, setShowArchived] = useState(false);

  // Filter and sort chats
  const filteredChats = chats
    .filter((chat) => {
      if (!showArchived && chat.archived) return false;
      if (showArchived && !chat.archived) return false;
      return chat.title.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "created":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "name":
          return a.title.localeCompare(b.title);
        case "lastUsed":
        default:
          return new Date(b.lastUsedAt) - new Date(a.lastUsedAt);
      }
    });

  const handleCreateChat = () => {
    const now = new Date();
    const defaultName = `دردشة جديدة - ${now.toLocaleDateString("ar")}`;
    onCreateChat(defaultName);
  };

  const handleRename = (chatId, newName) => {
    if (newName.trim()) {
      onRenameChat(chatId, newName.trim());
      setEditingChat(null);
      setNewChatName("");
      toast.success("تم تغيير اسم الدردشة");
    }
  };

  const handleDelete = (chatId, chatTitle) => {
    if (window.confirm(`هل أنت متأكد من حذف الدردشة "${chatTitle}"؟`)) {
      onDeleteChat(chatId);
      toast.success("تم حذف الدردشة");
    }
  };

  const handleArchive = (chatId, isArchived) => {
    onArchiveChat(chatId, !isArchived);
    toast.success(isArchived ? "تم إلغاء أرشفة الدردشة" : "تم أرشفة الدردشة");
  };

  const formatLastUsed = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));

    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440)
      return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  const getMessagePreview = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return "لا توجد رسائل";
    const lastMessage = chat.messages[chat.messages.length - 1];
    return lastMessage.message.length > 50
      ? lastMessage.message.substring(0, 50) + "..."
      : lastMessage.message;
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            إدارة الدردشات
          </h3>
          <EnhancedButton
            onClick={handleCreateChat}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            دردشة جديدة
          </EnhancedButton>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث في الدردشات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="lastUsed">آخر استخدام</option>
              <option value="created">تاريخ الإنشاء</option>
              <option value="name">الاسم</option>
            </select>

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                showArchived
                  ? "bg-gray-200 text-gray-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {showArchived ? "عرض النشطة" : "عرض المؤرشفة"}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardBody className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>
                {searchTerm
                  ? "لم يتم العثور على دردشات"
                  : showArchived
                  ? "لا توجد دردشات مؤرشفة"
                  : "لا توجد دردشات نشطة"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    activeChat?.id === chat.id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onSelectChat(chat)}
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
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(chat.id, newChatName);
                            }}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChat(null);
                              setNewChatName("");
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {chat.title}
                            </h4>
                            {chat.starred && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            {chat.archived && (
                              <Archive className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-2">
                            {getMessagePreview(chat)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{chat.messageCount || 0} رسالة</span>
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
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChat(chat.id);
                            setNewChatName(chat.title);
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded"
                          title="إعادة تسمية"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(chat.id, chat.archived);
                          }}
                          className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-100 rounded"
                          title={chat.archived ? "إلغاء الأرشفة" : "أرشفة"}
                        >
                          <Archive className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(chat.id, chat.title);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded"
                          title="حذف"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default ChatManager;
