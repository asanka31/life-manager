import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Tag, 
  CheckSquare, 
  Square, 
  Mic, 
  Image, 
  Play, 
  SquareDot, 
  Sparkles,
  Paperclip
} from 'lucide-react';

export const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, settings } = useApp();
  const t = translations[settings.language];

  // Filtering / Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Form Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Checklist dynamic state inside form
  const [checklist, setChecklist] = useState<{ text: string; checked: boolean }[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Tags dynamic state inside form
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [newImageLink, setNewImageLink] = useState('');

  // Voice note simulator
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const openAddModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setChecklist([]);
    setTags([]);
    setImages([]);
    setVoiceNotes([]);
    setModalOpen(true);
  };

  const openEditModal = (note: any) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setChecklist(note.checklist || []);
    setTags(note.tags || []);
    setImages(note.images || []);
    setVoiceNotes(note.voiceNotes || []);
    setModalOpen(true);
  };

  const addChecklistItemToForm = () => {
    if (!newChecklistItem.trim()) return;
    setChecklist([...checklist, { text: newChecklistItem.trim(), checked: false }]);
    setNewChecklistItem('');
  };

  const removeChecklistItemFromForm = (idx: number) => {
    setChecklist(checklist.filter((_, i) => i !== idx));
  };

  const addTagToForm = () => {
    if (!newTag.trim()) return;
    if (!tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
    }
    setNewTag('');
  };

  const removeTagFromForm = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const addImageToForm = () => {
    if (!newImageLink.trim()) return;
    setImages([...images, newImageLink.trim()]);
    setNewImageLink('');
  };

  const triggerVoiceRecord = () => {
    setIsRecording(true);
    // Simulate recording stop in 1.5 seconds
    setTimeout(() => {
      setIsRecording(false);
      const randomID = Math.floor(Math.random() * 1000);
      setVoiceNotes([...voiceNotes, `Voice Recording #${randomID} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`]);
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const payload = {
      title: title || 'Untitled Note',
      content,
      checklist,
      tags,
      images,
      voiceNotes
    };

    if (editingNote) {
      await updateNote(editingNote.id, payload);
    } else {
      await addNote(payload);
    }
    setModalOpen(false);
  };

  // Toggle checklist item directly from the note card
  const toggleCardChecklist = async (note: any, itemIdx: number) => {
    const updatedChecklist = [...(note.checklist || [])];
    updatedChecklist[itemIdx].checked = !updatedChecklist[itemIdx].checked;
    await updateNote(note.id, { checklist: updatedChecklist });
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (note.tags && note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  // Extract all unique tags in entire notes set
  const allUniqueTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.notes}</h2>
          <p className="text-xs text-slate-500">Log journals, structure lists, and secure memos</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
        >
          <Plus size={16} />
          <span>{t.addNote}</span>
        </button>
      </div>

      {/* Search and Tags filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search notes, tags, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500"
          />
        </div>

        {/* List of active tags */}
        {allUniqueTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-400">{t.tagsLabel}:</span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                !selectedTag 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {allUniqueTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  selectedTag === tag 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-500 hover:bg-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length === 0 ? (
          <div className="lg:col-span-3 md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-3xl text-slate-400 flex flex-col items-center justify-center">
            <CheckSquare size={40} className="text-slate-300 mb-2" />
            <p className="text-sm font-medium">{t.noNotes}</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div 
              key={note.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
            >
              <div>
                {/* Note Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">{note.createdAt.split('T')[0]}</span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => openEditModal(note)}
                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Optional Images inside notes */}
                {note.images && note.images.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-xl h-24 border border-slate-200/40">
                    <img 
                      src={note.images[0]} 
                      alt="Note attached"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback image
                        e.currentTarget.src = "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=400";
                      }}
                    />
                  </div>
                )}

                {/* Title */}
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mt-3">{note.title}</h4>
                
                {/* Content */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap leading-relaxed line-clamp-4">
                  {note.content}
                </p>

                {/* Sub-Checklist (If exist) */}
                {note.checklist && note.checklist.length > 0 && (
                  <div className="mt-4 space-y-1.5 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">{t.checklistLabel}</p>
                    {note.checklist.map((item: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-2 cursor-pointer text-xs"
                        onClick={() => toggleCardChecklist(note, idx)}
                      >
                        {item.checked ? (
                          <CheckSquare size={14} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Square size={14} className="text-slate-300 flex-shrink-0" />
                        )}
                        <span className={`truncate ${item.checked ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Simulated Voice Notes List */}
                {note.voiceNotes && note.voiceNotes.length > 0 && (
                  <div className="mt-3 space-y-1 bg-indigo-50/40 dark:bg-slate-950/20 p-3 rounded-2xl border border-indigo-100/30">
                    <p className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1.5 mb-1">
                      <Mic size={10} />
                      {t.voiceNotesLabel}
                    </p>
                    {note.voiceNotes.map((rec: string, rIdx: number) => (
                      <div key={rIdx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                        <Play size={10} className="text-indigo-500 cursor-pointer hover:scale-110 transition-transform" />
                        <span className="truncate">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags badgify */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  {note.tags.map(tg => (
                    <span 
                      key={tg} 
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold rounded-md text-[9px] hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTag(tg);
                      }}
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Note Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-xl overflow-hidden animate-zoom-in">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {editingNote ? t.edit : t.addNote}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.title} *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Note Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                />
              </div>

              {/* Rich text area content */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{t.notesLabel}</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write note contents..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none resize-y"
                />
              </div>

              {/* Checklist builder */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 mb-0.5">{t.checklistLabel}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={100}
                    placeholder={t.addChecklistItem}
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addChecklistItemToForm}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    Add
                  </button>
                </div>

                {checklist.length > 0 && (
                  <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl max-h-28 overflow-y-auto">
                    {checklist.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{item.text}</span>
                        <button 
                          type="button" 
                          onClick={() => removeChecklistItemFromForm(index)}
                          className="text-rose-500 hover:underline text-[10px]"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tag builder */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 mb-0.5">{t.tagsLabel}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={20}
                    placeholder={t.addTag}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTagToForm}
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    Add
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                    {tags.map((tg, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-0.5 bg-indigo-50 dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold rounded-md border border-indigo-100/30 flex items-center gap-1.5"
                      >
                        #{tg}
                        <button 
                          type="button" 
                          onClick={() => removeTagFromForm(tg)}
                          className="text-rose-500 font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Extra components: Image link attachment & voice notes simulator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                {/* Images attachment mockup */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Image size={14} />
                    Attach Image URL
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newImageLink}
                      onChange={(e) => setNewImageLink(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 outline-none"
                    />
                    <button
                      type="button"
                      onClick={addImageToForm}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-950 rounded-lg text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                  {images.length > 0 && (
                    <p className="text-[10px] text-emerald-500 font-semibold">{images.length} Image(s) Attached</p>
                  )}
                </div>

                {/* Simulated Recorder */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Mic size={14} />
                    {t.voiceNotesLabel}
                  </label>
                  <button
                    type="button"
                    onClick={triggerVoiceRecord}
                    disabled={isRecording}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                      isRecording 
                        ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse' 
                        : 'bg-indigo-600 text-white shadow-xs'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <SquareDot size={14} className="animate-spin" />
                        <span>Recording 1.5s...</span>
                      </>
                    ) : (
                      <>
                        <Mic size={14} />
                        <span>Simulate Voice Record</span>
                      </>
                    )}
                  </button>
                  {voiceNotes.length > 0 && (
                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold">{voiceNotes.length} Voice Memo(s) Attached</p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60 font-semibold">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
