
import React from "react";
import TabItem from "@/components/TabItem";
import { Tabs, TabsList } from "@/components/ui/tabs";
import CommentEditModal from "@/components/CommentEditModal";
import TabBarAddButton from "./TabBarAddButton";
import { useTabs } from "@/contexts/TabsContext";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TabType {
  id: string;
  name: string;
  sql: string;
  result: { columns: string[]; rows: Array<any[]> } | null;
  error: string | null;
  isRunning: boolean;
  comment?: string;
}

interface TabBarProps {
  tabs: TabType[];
  activeTabId: string | null;
  setActiveTabId: (id: string) => void;
  addTab: () => void;
  closeTab: (id: string) => void;
  renameTab: (id: string, name: string) => void;
  duplicateTab: (id: string) => void;
}

const SortableTabItem: React.FC<{
  tab: TabType;
  index: number;
  isActive: boolean;
  isEditing: boolean;
  onDoubleClick: (tab: TabType) => void;
  editValue: string;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditBlur: (tabId: string) => void;
  onEditKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, tabId: string) => void;
  setActiveTabId: (id: string) => void;
  duplicateTab: (id: string) => void;
  closeTab: (id: string) => void;
  openCommentModal: (tab: TabType) => void;
  comment: string | undefined;
  disabled?: boolean;
}> = ({
  tab,
  index,
  isActive,
  isEditing,
  onDoubleClick,
  editValue,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  setActiveTabId,
  duplicateTab,
  closeTab,
  openCommentModal,
  comment,
  disabled = false,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tab.id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        cursor: disabled ? "default" : "grab",
        touchAction: "none",
      }}
      {...attributes}
      {...listeners}
    >
      <TabItem
        tab={tab}
        isActive={isActive}
        isEditing={isEditing}
        onDoubleClick={onDoubleClick}
        editValue={editValue}
        onEditChange={onEditChange}
        onEditBlur={onEditBlur}
        onEditKeyDown={onEditKeyDown}
        setActiveTabId={setActiveTabId}
        duplicateTab={duplicateTab}
        closeTab={closeTab}
        openCommentModal={openCommentModal}
        comment={comment}
      />
    </div>
  );
};

const TabBar: React.FC<TabBarProps> = ({
  tabs: propsTabs,
  activeTabId: propsActiveTabId,
  setActiveTabId: propsSetActiveTabId,
  addTab: propsAddTab,
  closeTab: propsCloseTab,
  renameTab: propsRenameTab,
  duplicateTab: propsDuplicateTab,
}) => {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    addTab,
    closeTab,
    renameTab,
    duplicateTab,
    setTabs,
  } = useTabs();

  // State for editing tab name
  const [editTabId, setEditTabId] = React.useState<string | null>(null);
  const [tabNameDraft, setTabNameDraft] = React.useState<string>("");

  // State for editing comment (modal)
  const [commentModal, setCommentModal] = React.useState<{
    open: boolean;
    tabId: string | null;
    currentComment: string;
  }>({
    open: false,
    tabId: null,
    currentComment: "",
  });

  // Demo state for tab comments
  const [comments, setComments] = React.useState<{ [tabId: string]: string }>({});

  // --- Tab renaming ---
  const handleTabDoubleClick = (tab: TabType) => {
    setEditTabId(tab.id);
    setTabNameDraft(tab.name);
  };
  const handleTabNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTabNameDraft(e.target.value);
  };
  const handleTabNameBlur = (tabId: string) => {
    if (tabNameDraft && tabNameDraft !== tabs.find(t => t.id === tabId)?.name) {
      renameTab(tabId, tabNameDraft);
    }
    setEditTabId(null);
  };
  const handleTabNameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    tabId: string
  ) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setEditTabId(null);
    }
  };

  // --- Comment modal triggers ---
  const openCommentModal = (tab: TabType) => {
    setCommentModal({
      open: true,
      tabId: tab.id,
      currentComment: comments[tab.id] ?? tab.comment ?? "",
    });
  };
  const handleSaveComment = () => {
    if (commentModal.tabId) {
      setComments((prev) => ({
        ...prev,
        [commentModal.tabId!]: commentModal.currentComment,
      }));
    }
    setCommentModal({ open: false, tabId: null, currentComment: "" });
  };

  // --- DRAG-AND-DROP LOGIC ---
  // dnd-kit setup
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tabs.findIndex(tab => tab.id === active.id);
    const newIndex = tabs.findIndex(tab => tab.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Move tabs in state
    setTabs(arrayMove(tabs, oldIndex, newIndex));
  }

  return (
    <div
      className="w-full bg-white select-none"
      style={{ border: "none", boxShadow: "none", paddingLeft: "2rem" }}
    >
      <Tabs
        value={activeTabId || (tabs.length > 0 ? tabs[0].id : undefined)}
        onValueChange={setActiveTabId}
      >
        <TabsList
          className="flex flex-row items-center bg-white p-0 gap-0 justify-start w-auto min-w-0"
          style={{
            margin: 0,
            border: "none",
            boxShadow: "none",
            minHeight: "44px"
          }}
        >
          <div
            className="flex flex-row items-center gap-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 py-1"
            style={{
              flex: "1 1 0%",
              minHeight: "44px",
              maxWidth: "100vw",
              WebkitOverflowScrolling: "touch",
              paddingRight: "0.5rem"
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tabs.map(t => t.id)}
                strategy={horizontalListSortingStrategy}
              >
                {tabs.map((tab, idx) => (
                  <SortableTabItem
                    key={tab.id}
                    tab={tab}
                    index={idx}
                    isActive={tab.id === activeTabId}
                    isEditing={editTabId === tab.id}
                    onDoubleClick={handleTabDoubleClick}
                    editValue={tabNameDraft}
                    onEditChange={handleTabNameChange}
                    onEditBlur={handleTabNameBlur}
                    onEditKeyDown={handleTabNameKeyDown}
                    setActiveTabId={setActiveTabId}
                    duplicateTab={duplicateTab}
                    closeTab={closeTab}
                    openCommentModal={openCommentModal}
                    comment={comments[tab.id]}
                  />
                ))}
              </SortableContext>
            </DndContext>
            <TabBarAddButton addTab={addTab} />
          </div>
        </TabsList>
      </Tabs>
      {/* Modal to edit comment */}
      <CommentEditModal
        open={commentModal.open}
        value={commentModal.currentComment}
        onChange={v =>
          setCommentModal(modal => ({ ...modal, currentComment: v }))
        }
        onSave={handleSaveComment}
        onClose={() =>
          setCommentModal({ open: false, tabId: null, currentComment: "" })
        }
      />
    </div>
  );
};

export default TabBar;
