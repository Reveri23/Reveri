
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const EMOJI_MAP = {
  happy: "😊",
  sad: "😢",
  surprised: "😲",
  angry: "😠",
  nostalgic: "🥹",
  default: "🤖",
};

function Avatar({ emotion }) {
  return (
    <div className="text-6xl p-4 text-center">
      {EMOJI_MAP[emotion] || EMOJI_MAP.default}
      <div className="text-sm mt-2 text-gray-500 capitalize">{emotion}</div>
    </div>
  );
}

function MemoryCard({ memory, onDelete }) {
  return (
    <div className="border p-4 rounded-2xl shadow bg-white my-2">
      <div className="flex justify-between items-center">
        <div className="font-bold text-lg">{memory.title}</div>
        <button
          onClick={() => onDelete(memory.id)}
          className="text-red-500 hover:underline text-sm"
        >
          Delete
        </button>
      </div>
      <p className="text-gray-600 whitespace-pre-wrap">{memory.description}</p>
      <div className="text-sm mt-2 text-gray-400">
        <span className="italic">{new Date(memory.date).toLocaleDateString()}</span>
        <br />
        Emotion: {memory.emotion}
        {memory.tags.length > 0 && (
          <div className="mt-1">
            Tags: {memory.tags.map(t => `#${t}`).join(" ")}
          </div>
        )}
      </div>
    </div>
  );
}

function MemoryForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [emotion, setEmotion] = useState("happy");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onAdd({
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      emotion,
      tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag),
      date
    });
    setTitle("");
    setDescription("");
    setEmotion("happy");
    setTags("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-2xl shadow mb-4">
      <input
        type="text"
        placeholder="Memory title"
        className="w-full p-2 mb-2 border rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Describe your memory..."
        className="w-full p-2 mb-2 border rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <select
        value={emotion}
        onChange={(e) => setEmotion(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      >
        {Object.keys(EMOJI_MAP).map((emo) =>
          emo !== "default" && (
            <option key={emo} value={emo}>
              {emo.charAt(0).toUpperCase() + emo.slice(1)}
            </option>
          )
        )}
      </select>
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        className="w-full p-2 mb-2 border rounded"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <input
        type="date"
        className="w-full p-2 mb-2 border rounded"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
      >
        Add Memory
      </button>
    </form>
  );
}

export default function ReveriApp() {
  const [memories, setMemories] = useState([]);
  const [query, setQuery] = useState("");
  const [emotionFilter, setEmotionFilter] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("reveri_memories");
    if (stored) setMemories(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("reveri_memories", JSON.stringify(memories));
  }, [memories]);

  const addMemory = (memory) => setMemories((prev) => [...prev, memory]);
  const deleteMemory = (id) =>
    setMemories((prev) => prev.filter((m) => m.id !== id));

  const currentEmotion = memories.length
    ? memories[memories.length - 1].emotion
    : "default";

  const filteredMemories = memories.filter((m) => {
    const matchesQuery =
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase());
    const matchesEmotion = emotionFilter ? m.emotion === emotionFilter : true;
    return matchesQuery && matchesEmotion;
  });

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-indigo-700">
        🧠 Reveri Memory Companion
      </h1>
      <Avatar emotion={currentEmotion} />

      <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Search memories..."
          className="w-full p-2 mb-2 md:mb-0 border rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={emotionFilter}
          onChange={(e) => setEmotionFilter(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded"
        >
          <option value="">All Emotions</option>
          {Object.keys(EMOJI_MAP).map((emo) =>
            emo !== "default" && (
              <option key={emo} value={emo}>
                {emo.charAt(0).toUpperCase() + emo.slice(1)}
              </option>
            )
          )}
        </select>
      </div>

      <MemoryForm onAdd={addMemory} />

      <div className="space-y-2">
        {filteredMemories.length > 0 ? (
          filteredMemories
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((m) => (
              <MemoryCard key={m.id} memory={m} onDelete={deleteMemory} />
            ))
        ) : (
          <p className="text-center text-gray-500">No memories found.</p>
        )}
      </div>
    </div>
  );
}
