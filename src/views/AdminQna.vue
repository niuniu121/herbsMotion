<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <p class="badge">Admin Panel</p>
          <h1>QNA Management</h1>
        </div>

        <button class="back-btn" type="button" @click="handleBackClick">Back</button>
      </div>

      <div class="admin-card">
        <div v-if="loading" class="loading-text">Loading QNA content...</div>

        <div v-else class="content-wrap">
          <div class="toolbar">
            <div class="toolbar-left">
              <h2>QNA Page Sections</h2>
            </div>

            <div class="toolbar-right">
              <button class="secondary-btn" type="button" @click="addSection">+ Add Section</button>

              <button class="save-btn" type="button" :disabled="saving" @click="saveContent">
                {{ saving ? 'Saving...' : 'Save QNA Page' }}
              </button>
            </div>
          </div>

          <p v-if="inlineErrorMessage" class="error-text">{{ inlineErrorMessage }}</p>

          <div v-if="pageContent.sections.length === 0" class="empty-state">
            <p>No sections yet.</p>
            <button class="secondary-btn" type="button" @click="restoreOriginalContent">
              Import Original Content
            </button>
          </div>

          <draggable
            v-else
            v-model="pageContent.sections"
            item-key="id"
            handle=".section-drag-handle"
            animation="220"
            ghost-class="drag-ghost"
            chosen-class="drag-chosen"
            class="section-list"
          >
            <template #item="{ element: section, index }">
              <section class="admin-section" :id="section.id">
                <div class="section-heading">
                  <div class="section-heading-left">
                    <button
                      class="section-drag-handle"
                      type="button"
                      title="Drag section to reorder"
                    >
                      ⋮⋮
                    </button>

                    <button
                      class="section-summary-btn"
                      type="button"
                      @click="toggleBlock(section.id)"
                    >
                      <div>
                        <p class="section-kicker">
                          {{ section.kicker || getDefaultKicker(section.type) }}
                        </p>

                        <h3>{{ section.title || 'New Section' }}</h3>

                        <p class="section-subtitle">
                          <span v-if="section.items?.length">
                            · {{ section.items.length }} item(s)
                          </span>
                        </p>
                      </div>

                      <span class="expand-icon" :class="{ expanded: isExpanded(section.id) }">
                        ▾
                      </span>
                    </button>
                  </div>

                  <div class="section-actions">
                    <button
                      class="toggle-btn"
                      :class="{ active: section.visible }"
                      type="button"
                      @click="section.visible = !section.visible"
                    >
                      {{ section.visible ? 'Visible' : 'Hidden' }}
                    </button>

                    <button
                      class="danger-btn"
                      type="button"
                      @click="askRemoveItem('section', index, section.title)"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div v-if="isExpanded(section.id)" class="section-editor">
                  <div class="section-form">
                    <div class="form-group">
                      <label>Section Type</label>
                      <select v-model="section.type">
                        <option value="qna">QNA Section</option>
                        <option value="food">Food Guidance Section</option>
                        <option value="lifestyle">Lifestyle Guidance Section</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label>Section Kicker</label>
                      <input
                        v-model.trim="section.kicker"
                        type="text"
                        placeholder="e.g. LIFESTYLE GUIDANCE"
                      />
                    </div>

                    <div class="form-group">
                      <label>Section Title</label>
                      <input
                        v-model.trim="section.title"
                        type="text"
                        placeholder="e.g. Rest, Lifestyle & Emotional Wellbeing"
                      />
                    </div>

                    <div class="form-group">
                      <label>Section Description</label>
                      <textarea
                        v-model="section.description"
                        rows="3"
                        placeholder="Section description shown on the front-end"
                      ></textarea>
                    </div>
                  </div>

                  <!-- QNA ITEMS -->
                  <div v-if="section.type === 'qna'" class="section-content-area">
                    <div class="sub-section-header">
                      <div>
                        <h4>QNA Items</h4>
                      </div>

                      <button class="secondary-btn" type="button" @click="addQna(section)">
                        + Add QNA Item
                      </button>
                    </div>

                    <div v-if="!section.items || section.items.length === 0" class="empty-state">
                      <p>No QNA items yet.</p>
                      <button class="secondary-btn" type="button" @click="addQna(section)">
                        Create First QNA Item
                      </button>
                    </div>

                    <draggable
                      v-else
                      v-model="section.items"
                      item-key="id"
                      handle=".drag-handle"
                      animation="220"
                      ghost-class="drag-ghost"
                      chosen-class="drag-chosen"
                      class="qna-list"
                    >
                      <template #item="{ element: qna, index: qnaIndex }">
                        <div class="qna-block" :id="qna.id">
                          <div class="qna-block-header">
                            <div class="qna-header-left">
                              <button class="drag-handle" type="button" title="Drag to reorder">
                                ⋮⋮
                              </button>

                              <button
                                class="qna-summary-btn"
                                type="button"
                                @click="toggleBlock(qna.id)"
                              >
                                <div class="qna-summary-text">
                                  <span class="qna-index">QNA {{ qnaIndex + 1 }}</span>
                                  <h3>{{ qna.question || 'New QNA Item' }}</h3>
                                </div>

                                <span class="expand-icon" :class="{ expanded: isExpanded(qna.id) }">
                                  ▾
                                </span>
                              </button>
                            </div>

                            <div class="qna-actions">
                              <button
                                class="toggle-btn"
                                :class="{ active: qna.visible }"
                                type="button"
                                @click="qna.visible = !qna.visible"
                              >
                                {{ qna.visible ? 'Visible' : 'Hidden' }}
                              </button>

                              <button
                                class="danger-btn"
                                type="button"
                                @click="askRemoveNestedItem('qna', section, qnaIndex, qna.question)"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div v-if="isExpanded(qna.id)" class="qna-grid">
                            <div class="form-side">
                              <div class="form-group">
                                <label>Question</label>
                                <input v-model.trim="qna.question" type="text" placeholder="" />
                              </div>

                              <div class="form-group">
                                <div class="answer-label-row">
                                  <label>Answer</label>
                                  <button
                                    type="button"
                                    class="mini-btn"
                                    @click="qna.answerExpanded = !qna.answerExpanded"
                                  >
                                    {{ qna.answerExpanded ? 'Collapse' : 'Edit answer' }}
                                  </button>
                                </div>

                                <textarea
                                  v-model="qna.answer"
                                  class="answer-textarea"
                                  :class="{ expanded: qna.answerExpanded }"
                                  rows="8"
                                  placeholder=""
                                ></textarea>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </draggable>
                  </div>

                  <!-- FOOD GROUPS -->
                  <div v-else-if="section.type === 'food'" class="section-content-area">
                    <div class="sub-section-header">
                      <div>
                        <h4>Food Groups</h4>
                      </div>

                      <button class="secondary-btn" type="button" @click="addFoodGroup(section)">
                        + Add Food Group
                      </button>
                    </div>

                    <div v-if="!section.items || section.items.length === 0" class="empty-state">
                      <p>No food groups yet.</p>
                      <button class="secondary-btn" type="button" @click="addFoodGroup(section)">
                        Create First Food Group
                      </button>
                    </div>

                    <draggable
                      v-else
                      v-model="section.items"
                      item-key="id"
                      handle=".drag-handle"
                      animation="220"
                      ghost-class="drag-ghost"
                      chosen-class="drag-chosen"
                      class="qna-list"
                    >
                      <template #item="{ element: group, index: groupIndex }">
                        <div class="qna-block" :id="group.id">
                          <div class="qna-block-header">
                            <div class="qna-header-left">
                              <button class="drag-handle" type="button" title="Drag to reorder">
                                ⋮⋮
                              </button>

                              <button
                                class="qna-summary-btn"
                                type="button"
                                @click="toggleBlock(group.id)"
                              >
                                <div class="qna-summary-text">
                                  <span class="qna-index">Food Group {{ groupIndex + 1 }}</span>
                                  <h3>{{ group.title || 'New Food Group' }}</h3>
                                </div>

                                <span
                                  class="expand-icon"
                                  :class="{ expanded: isExpanded(group.id) }"
                                >
                                  ▾
                                </span>
                              </button>
                            </div>

                            <div class="qna-actions">
                              <button
                                class="toggle-btn"
                                :class="{ active: group.visible }"
                                type="button"
                                @click="group.visible = !group.visible"
                              >
                                {{ group.visible ? 'Visible' : 'Hidden' }}
                              </button>

                              <button
                                class="danger-btn"
                                type="button"
                                @click="
                                  askRemoveNestedItem('food', section, groupIndex, group.title)
                                "
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div v-if="isExpanded(group.id)" class="qna-grid one-col">
                            <div class="form-side">
                              <div class="form-group">
                                <label>Food Group Title</label>
                                <input
                                  v-model.trim="group.title"
                                  type="text"
                                  placeholder="e.g. Seafood"
                                />
                              </div>

                              <div class="form-group">
                                <label>Food Items</label>
                                <textarea
                                  :value="group.items.join('\n')"
                                  class="answer-textarea expanded"
                                  rows="8"
                                  placeholder="One food item per line"
                                  @input="updateFoodItems(group, $event.target.value)"
                                ></textarea>

                                <p class="helper-text">Write one food item per line.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </draggable>
                  </div>

                  <!-- LIFESTYLE CARDS -->
                  <div v-else-if="section.type === 'lifestyle'" class="section-content-area">
                    <div class="sub-section-header">
                      <div>
                        <h4>Lifestyle Cards</h4>
                      </div>

                      <button
                        class="secondary-btn"
                        type="button"
                        @click="addLifestyleCard(section)"
                      >
                        + Add Lifestyle Card
                      </button>
                    </div>

                    <div v-if="!section.items || section.items.length === 0" class="empty-state">
                      <p>No lifestyle cards yet.</p>
                      <button
                        class="secondary-btn"
                        type="button"
                        @click="addLifestyleCard(section)"
                      >
                        Create First Lifestyle Card
                      </button>
                    </div>

                    <draggable
                      v-else
                      v-model="section.items"
                      item-key="id"
                      handle=".drag-handle"
                      animation="220"
                      ghost-class="drag-ghost"
                      chosen-class="drag-chosen"
                      class="qna-list"
                    >
                      <template #item="{ element: card, index: cardIndex }">
                        <div class="qna-block" :id="card.id">
                          <div class="qna-block-header">
                            <div class="qna-header-left">
                              <button class="drag-handle" type="button" title="Drag to reorder">
                                ⋮⋮
                              </button>

                              <button
                                class="qna-summary-btn"
                                type="button"
                                @click="toggleBlock(card.id)"
                              >
                                <div class="qna-summary-text">
                                  <span class="qna-index">Lifestyle {{ cardIndex + 1 }}</span>
                                  <h3>{{ card.title || 'New Lifestyle Card' }}</h3>
                                </div>

                                <span
                                  class="expand-icon"
                                  :class="{ expanded: isExpanded(card.id) }"
                                >
                                  ▾
                                </span>
                              </button>
                            </div>

                            <div class="qna-actions">
                              <button
                                class="toggle-btn"
                                :class="{ active: card.visible }"
                                type="button"
                                @click="card.visible = !card.visible"
                              >
                                {{ card.visible ? 'Visible' : 'Hidden' }}
                              </button>

                              <button
                                class="danger-btn"
                                type="button"
                                @click="
                                  askRemoveNestedItem('lifestyle', section, cardIndex, card.title)
                                "
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div v-if="isExpanded(card.id)" class="qna-grid one-col">
                            <div class="form-side">
                              <div class="form-group">
                                <label>Card Title</label>
                                <input
                                  v-model.trim="card.title"
                                  type="text"
                                  placeholder="e.g. Rest & Lifestyle"
                                />
                              </div>

                              <div class="form-group">
                                <label>Description</label>
                                <textarea
                                  v-model="card.description"
                                  class="answer-textarea expanded"
                                  rows="6"
                                  placeholder="Enter lifestyle description"
                                ></textarea>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </draggable>
                  </div>
                </div>
              </section>
            </template>
          </draggable>

          <div class="bottom-action-row">
            <button class="save-btn" type="button" :disabled="saving" @click="saveContent">
              {{ saving ? 'Saving...' : 'Save QNA Page' }}
            </button>
          </div>

          <div class="floating-save-bar">
            <button class="save-btn" type="button" :disabled="saving" @click="saveContent">
              {{ saving ? 'Saving...' : 'Save QNA Page' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="successModal.open" class="modal-overlay" @click.self="closeSuccessModal">
      <div class="modal-card success-modal-card">
        <div class="modal-icon success-icon">✓</div>
        <h3>{{ successModal.title }}</h3>
        <p>{{ successModal.message }}</p>
        <div class="modal-actions center">
          <button class="modal-btn primary" type="button" @click="closeSuccessModal">OK</button>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="errorModal.open" class="modal-overlay" @click.self="closeErrorModal">
      <div class="modal-card error-modal-card">
        <div class="modal-icon error-icon">!</div>
        <h3>{{ errorModal.title }}</h3>
        <p>{{ errorModal.message }}</p>
        <div class="modal-actions center">
          <button class="modal-btn danger" type="button" @click="closeErrorModal">OK</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteModal.open" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-card">
        <div class="modal-icon neutral-icon">?</div>
        <h3>Delete Item</h3>
        <p>
          Are you sure you want to delete
          <strong>{{ deleteModal.label || 'this item' }}</strong
          >?
        </p>

        <div class="modal-actions">
          <button
            class="modal-btn secondary"
            type="button"
            @click="closeDeleteModal"
            :disabled="deleting"
          >
            Cancel
          </button>

          <button
            class="modal-btn danger"
            type="button"
            @click="confirmRemoveItem"
            :disabled="deleting"
          >
            {{ deleting ? 'Deleting...' : 'Delete Now' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Unsaved Changes Modal -->
    <div v-if="unsavedModal.open" class="modal-overlay" @click.self="closeUnsavedModal">
      <div class="modal-card">
        <div class="modal-icon neutral-icon">!</div>
        <h3>Unsaved Changes</h3>
        <p>You have unsaved changes on this page. Do you want to leave without saving?</p>

        <div class="modal-actions">
          <button class="modal-btn secondary" type="button" @click="closeUnsavedModal">
            Stay Here
          </button>

          <button class="modal-btn danger" type="button" @click="confirmLeavePage">
            Leave Anyway
          </button>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="previewModal.open" class="modal-overlay" @click.self="closePreviewModal">
      <div class="modal-card preview-modal-card">
        <div class="modal-icon neutral-icon">i</div>
        <h3>{{ previewModal.question || 'QNA Preview' }}</h3>
        <div class="preview-modal-content">
          <p v-for="(paragraph, pIndex) in parseAnswer(previewModal.answer)" :key="pIndex">
            {{ paragraph }}
          </p>
        </div>

        <div class="modal-actions center">
          <button class="modal-btn primary" type="button" @click="closePreviewModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import draggable from 'vuedraggable'
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { db } from '@/firebase'

const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const inlineErrorMessage = ref('')
const expandedIds = ref([])
const lastSavedSnapshot = ref('{}')
const pendingLeaveTarget = ref(null)
const pendingNestedDelete = ref(null)

const pageContent = ref({
  sections: [],
})

const successModal = ref({
  open: false,
  title: 'Saved Successfully',
  message: 'Your QNA page content has been updated.',
})

const errorModal = ref({
  open: false,
  title: 'Something Went Wrong',
  message: '',
})

const deleteModal = ref({
  open: false,
  type: '',
  index: null,
  label: '',
})

const unsavedModal = ref({
  open: false,
})

const previewModal = ref({
  open: false,
  question: '',
  answer: '',
})

const originalContent = {
  sections: [
    {
      id: 'section_qna_main',
      type: 'qna',
      kicker: 'MAIN SECTION',
      title: 'QNA Items',
      description: 'Frequently asked questions about herbal medicine guidance.',
      visible: true,
      items: [
        {
          id: 'qna_granulated_herbs',
          question: 'What are granulated herbs?',
          answer: `Granulated herbs are concentrated, water-soluble extracts of Traditional Chinese Medicine (TCM) herbs.

They are made by:
• Boiling raw herbs into a decoction
• Spray-drying the liquid into powder or granules
• Often including a small amount of starch as a carrier

Why use them?
• Convenient alternative to traditional herbal teas
• No long boiling required
• Simply dissolve in hot water and drink`,
          visible: true,
        },
        {
          id: 'qna_take_granulated_herbs',
          question: 'How do I take granulated herbs?',
          answer: `• Measure the prescribed number of flat spoons into a cup.
• Add around 150 ml of hot water. Do not microwave.
• Stir well and drink the mixture.
• It is okay if some granules do not fully dissolve.

When to take:
• Option 1: Take twice daily, 40 minutes after meals.
• Option 2: Choose any two times: 10 AM, 4 PM, or 9 PM.

Important:
• Do not take on an empty stomach.
• Do not take within 1 hour before sleep.`,
          visible: true,
        },
        {
          id: 'qna_herbal_pills',
          question: 'How do I take herbal pills?',
          answer: `Take the prescribed amount with warm water.

Timing options:
• Option 1: Twice daily, 40 minutes after meals.
• Option 2: Choose two times from 10 AM, 4 PM, or 9 PM.

Important:
• Avoid taking herbal pills when hungry.
• Avoid taking herbal pills within 1 hour before sleep.`,
          visible: true,
        },
        {
          id: 'qna_side_effects',
          question: 'What if I experience side effects?',
          answer: `Some people may experience:
• Temporary worsening of symptoms
• Mild allergic reactions
• Stomach discomfort or cramping
• Loose stools
• Nausea

Rare but possible:
• Interaction with medications
• Effects on blood pressure, liver, or kidney function
• Changes in bleeding, clotting, or hormones

What to do:
• Stop taking the herbs.
• Seek medical advice if symptoms are unexpected or severe.`,
          visible: true,
        },
        {
          id: 'qna_awareness',
          question: 'What should I be aware of while taking herbs?',
          answer: `Healthy eating:
• Eat warm, light, simple, and moderate meals.
• Warm: avoid cold food and drinks.
• Light: reduce salty, spicy, sweet, and sour foods.
• Simple: choose one main dish with one to two sides.
• Moderate: eat until around 70% full.

Focus on:
• Grains
• Vegetables
• Minimal meat`,
          visible: true,
        },
        {
          id: 'qna_sleep_lifestyle',
          question: 'How should I manage sleep and lifestyle?',
          answer: `Sleep well:
• Aim for at least 8 hours of sleep.
• The recommended routine is to sleep by 10 PM and wake by 6 AM.`,
          visible: true,
        },
      ],
    },
    {
      id: 'section_food_avoid',
      type: 'food',
      kicker: 'FOOD GUIDANCE',
      title: 'Foods to Avoid While Taking Herbs',
      description:
        'These foods may be unsuitable during herbal treatment depending on your condition and prescription.',
      visible: true,
      items: [
        {
          id: 'avoid_raw_cold',
          title: 'Raw or cold foods (general category)',
          visible: true,
          items: ['Raw or cold foods', 'Fermented glutinous rice', 'Pickles', 'Persimmon'],
        },
        {
          id: 'avoid_fried_spicy',
          title: 'Fried & Spicy',
          visible: true,
          items: ['Fried foods', 'Spicy foods', 'Chili'],
        },
        {
          id: 'avoid_poultry',
          title: 'Poultry',
          visible: true,
          items: ['Chicken head', 'Goose meat'],
        },
        {
          id: 'avoid_seafood',
          title: 'Seafood',
          visible: true,
          items: ['Shrimp', 'Crab', 'Hairtail', 'Yellow croaker', 'Pomfret', 'Shellfish'],
        },
        {
          id: 'avoid_red_meats',
          title: 'Red Meats & Exotic Meats',
          visible: true,
          items: ['Lamb', 'Beef, especially for skin conditions', 'Pig head meat'],
        },
        {
          id: 'avoid_vegetables_herbs',
          title: 'Certain Vegetables & Herbs',
          visible: true,
          items: ['Taro', 'Chinese chives', 'Mustard greens', 'Bamboo shoots', 'Eggplant'],
        },
        {
          id: 'avoid_fruits',
          title: 'Tropical & Hot-Natured Fruits',
          visible: true,
          items: ['Apricots', 'Durian', 'Pineapple', 'Mango', 'Bayberry', 'Lychee'],
        },
        {
          id: 'avoid_alcohol',
          title: 'Alcohol',
          visible: true,
          items: ['Alcoholic drinks'],
        },
      ],
    },
    {
      id: 'section_lifestyle',
      type: 'lifestyle',
      kicker: 'LIFESTYLE GUIDANCE',
      title: 'Rest, Lifestyle & Emotional Wellbeing',
      description:
        'Herbal treatment works best when supported by steady routines, adequate rest, and calm daily habits.',
      visible: true,
      items: [
        {
          id: 'lifestyle_rest',
          title: 'Rest & Lifestyle',
          description:
            'Balance work and rest, avoid overworking, keep warm after sweating, and avoid smoking.',
          visible: true,
        },
        {
          id: 'lifestyle_emotional',
          title: 'Emotional Wellbeing',
          description:
            'Maintain a positive mood, stay calm and relaxed, and avoid anger and stress where possible.',
          visible: true,
        },
      ],
    },
  ],
}

const deepClone = (value) => JSON.parse(JSON.stringify(value))

const createId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const getDefaultKicker = (type) => {
  if (type === 'food') return 'FOOD GUIDANCE'
  if (type === 'lifestyle') return 'LIFESTYLE GUIDANCE'
  return 'MAIN SECTION'
}

const getSectionTypeLabel = (type) => {
  if (type === 'food') return 'Food Guidance Section'
  if (type === 'lifestyle') return 'Lifestyle Guidance Section'
  return 'QNA Section'
}

const normalizeSectionItems = (section) => {
  if (!Array.isArray(section.items)) return []

  if (section.type === 'qna') {
    return section.items.map((item) => ({
      id: item.id || createId('qna'),
      question: item.question || '',
      answer: item.answer || '',
      visible: item.visible ?? true,
    }))
  }

  if (section.type === 'food') {
    return section.items.map((group) => ({
      id: group.id || createId('avoid'),
      title: group.title || '',
      visible: group.visible ?? true,
      items: Array.isArray(group.items) ? group.items.filter(Boolean) : [],
    }))
  }

  if (section.type === 'lifestyle') {
    return section.items.map((card) => ({
      id: card.id || createId('lifestyle'),
      title: card.title || '',
      description: card.description || '',
      visible: card.visible ?? true,
    }))
  }

  return []
}

const normalizeContentForSave = (content) => {
  const sections = Array.isArray(content.sections)
    ? content.sections.map((section) => ({
        id: section.id || createId('section'),
        type: section.type || 'qna',
        kicker: section.kicker || getDefaultKicker(section.type || 'qna'),
        title: section.title || '',
        description: section.description || '',
        visible: section.visible ?? true,
        items: normalizeSectionItems(section),
      }))
    : []

  return {
    sections,
  }
}

const getAllQnaItems = (content) => {
  return normalizeContentForSave(content)
    .sections.filter((section) => section.type === 'qna')
    .flatMap((section) => section.items || [])
}

const getFirstFoodSection = (content) => {
  return normalizeContentForSave(content).sections.find((section) => section.type === 'food')
}

const getFirstLifestyleSection = (content) => {
  return normalizeContentForSave(content).sections.find((section) => section.type === 'lifestyle')
}

const currentSnapshot = computed(() => JSON.stringify(normalizeContentForSave(pageContent.value)))
const hasUnsavedChanges = computed(() => currentSnapshot.value !== lastSavedSnapshot.value)

const updateSnapshot = () => {
  lastSavedSnapshot.value = JSON.stringify(normalizeContentForSave(pageContent.value))
}

const isExpanded = (id) => expandedIds.value.includes(id)

const toggleBlock = (id) => {
  if (isExpanded(id)) {
    expandedIds.value = expandedIds.value.filter((item) => item !== id)
  } else {
    expandedIds.value.push(id)
  }
}

const expandBlock = (id) => {
  if (!expandedIds.value.includes(id)) {
    expandedIds.value.push(id)
  }
}

const collapseAll = () => {
  expandedIds.value = []
}

const parseAnswer = (value) => {
  if (!value) return []

  return String(value)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

const getAnswerPreview = (value) => {
  if (!value) return 'No answer yet'
  const singleLine = String(value).replace(/\s+/g, ' ').trim()
  return singleLine.length > 88 ? `${singleLine.slice(0, 88)}...` : singleLine
}

const shouldShowPreviewToggle = (value) => {
  if (!value) return false
  return value.length > 220 || value.includes('\n')
}

const openPreviewModal = (qna) => {
  previewModal.value = {
    open: true,
    question: qna.question || 'QNA Preview',
    answer: qna.answer || '',
  }
}

const closePreviewModal = () => {
  previewModal.value.open = false
}

const openSuccessModal = (message = 'Your QNA page content has been updated.') => {
  successModal.value = {
    open: true,
    title: 'Saved Successfully',
    message,
  }
}

const closeSuccessModal = () => {
  successModal.value.open = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openErrorModal = (message) => {
  errorModal.value = {
    open: true,
    title: 'Unable to Complete Action',
    message,
  }
}

const closeErrorModal = () => {
  errorModal.value.open = false
}

const askRemoveItem = (type, index, label) => {
  pendingNestedDelete.value = null

  deleteModal.value = {
    open: true,
    type,
    index,
    label,
  }
}

const askRemoveNestedItem = (type, section, index, label) => {
  pendingNestedDelete.value = {
    type,
    section,
    index,
  }

  deleteModal.value = {
    open: true,
    type,
    index,
    label,
  }
}

const closeDeleteModal = () => {
  if (deleting.value) return

  deleteModal.value = {
    open: false,
    type: '',
    index: null,
    label: '',
  }

  pendingNestedDelete.value = null
}

const confirmRemoveItem = async () => {
  if (deleteModal.value.index === null || deleting.value) return

  deleting.value = true
  inlineErrorMessage.value = ''

  const targetDelete = pendingNestedDelete.value
    ? {
        mode: 'nested',
        section: pendingNestedDelete.value.section,
        index: pendingNestedDelete.value.index,
      }
    : {
        mode: 'section',
        index: deleteModal.value.index,
        type: deleteModal.value.type,
      }

  try {
    if (targetDelete.mode === 'nested') {
      targetDelete.section.items.splice(targetDelete.index, 1)
    } else if (targetDelete.type === 'section') {
      pageContent.value.sections.splice(targetDelete.index, 1)
    }

    deleteModal.value = {
      open: false,
      type: '',
      index: null,
      label: '',
    }
    pendingNestedDelete.value = null

    await persistContent(pageContent.value)
    pageContent.value = normalizeContentForSave(pageContent.value)
    updateSnapshot()
    collapseAll()
  } catch (error) {
    console.error('Failed to delete and save item:', error)
    const message = 'Failed to delete this item. Please try again.'
    inlineErrorMessage.value = message
    openErrorModal(message)
  } finally {
    deleting.value = false
  }
}

const openUnsavedModal = () => {
  unsavedModal.value.open = true
}

const closeUnsavedModal = () => {
  unsavedModal.value.open = false
  pendingLeaveTarget.value = null
}

const confirmLeavePage = () => {
  unsavedModal.value.open = false

  if (pendingLeaveTarget.value) {
    router.push(pendingLeaveTarget.value)
    pendingLeaveTarget.value = null
    return
  }

  router.push('/admin')
}

const handleBackClick = () => {
  if (hasUnsavedChanges.value) {
    pendingLeaveTarget.value = '/admin'
    openUnsavedModal()
    return
  }

  router.push('/admin')
}

const addSection = async () => {
  const newSection = {
    id: createId('section'),
    type: 'qna',
    kicker: 'MAIN SECTION',
    title: 'New Section',
    description: '',
    visible: true,
    items: [],
  }

  pageContent.value.sections.push(newSection)
  expandBlock(newSection.id)
  await scrollToElement(newSection.id)
}

const addQna = async (section) => {
  if (!Array.isArray(section.items)) section.items = []

  const newQna = {
    id: createId('qna'),
    question: '',
    answer: '',
    visible: true,
    answerExpanded: false,
  }

  section.items.push(newQna)
  expandBlock(newQna.id)
  await scrollToElement(newQna.id)
}

const addFoodGroup = async (section) => {
  if (!Array.isArray(section.items)) section.items = []

  const newGroup = {
    id: createId('avoid'),
    title: '',
    visible: true,
    items: [],
  }

  section.items.push(newGroup)
  expandBlock(newGroup.id)
  await scrollToElement(newGroup.id)
}

const addLifestyleCard = async (section) => {
  if (!Array.isArray(section.items)) section.items = []

  const newCard = {
    id: createId('lifestyle'),
    title: '',
    description: '',
    visible: true,
  }

  section.items.push(newCard)
  expandBlock(newCard.id)
  await scrollToElement(newCard.id)
}

const updateFoodItems = (group, value) => {
  group.items = String(value)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

const scrollToElement = async (id) => {
  await nextTick()

  const el = document.getElementById(id)

  if (el) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }
}

const validateContent = () => {
  const normalized = normalizeContentForSave(pageContent.value)

  const invalidSection = normalized.sections.find(
    (section) => section.visible !== false && !section.title.trim(),
  )

  if (invalidSection) {
    return 'Each visible section must have a section title.'
  }

  const invalidQna = normalized.sections
    .filter((section) => section.type === 'qna')
    .flatMap((section) => section.items)
    .find((item) => item.visible !== false && (!item.question.trim() || !item.answer.trim()))

  if (invalidQna) {
    return 'Each visible QNA item must have both a question and an answer.'
  }

  const invalidFoodGroup = normalized.sections
    .filter((section) => section.type === 'food')
    .flatMap((section) => section.items)
    .find((group) => group.visible !== false && !group.title.trim())

  if (invalidFoodGroup) {
    return 'Each visible food group must have a title.'
  }

  const invalidLifestyleCard = normalized.sections
    .filter((section) => section.type === 'lifestyle')
    .flatMap((section) => section.items)
    .find((card) => card.visible !== false && !card.title.trim())

  if (invalidLifestyleCard) {
    return 'Each visible lifestyle card must have a title.'
  }

  return ''
}

const persistContent = async (content) => {
  const normalized = normalizeContentForSave(content)
  const allQnaItems = getAllQnaItems(normalized)
  const firstFoodSection = getFirstFoodSection(normalized)
  const firstLifestyleSection = getFirstLifestyleSection(normalized)

  const qnaRef = doc(db, 'siteContent', 'qna')
  const qnaPageRef = doc(db, 'siteContent', 'qnaPage')
  const chatbotQnaRef = doc(db, 'siteContent', 'chatbotQNA')

  const batch = writeBatch(db)

  batch.set(
    qnaRef,
    {
      items: allQnaItems,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  batch.set(
    qnaPageRef,
    {
      ...normalized,
      qnaItems: allQnaItems,
      foodSection: firstFoodSection
        ? {
            title: firstFoodSection.title,
            description: firstFoodSection.description,
          }
        : {
            title: '',
            description: '',
          },
      avoidGroups: firstFoodSection?.items || [],
      lifestyleSection: firstLifestyleSection
        ? {
            title: firstLifestyleSection.title,
            description: firstLifestyleSection.description,
          }
        : {
            title: '',
            description: '',
          },
      lifestyleCards: firstLifestyleSection?.items || [],
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  batch.set(
    chatbotQnaRef,
    {
      items: allQnaItems,
      quickQuestions: allQnaItems
        .filter((item) => item.visible && item.question.trim() && item.answer.trim())
        .map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
        })),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  await batch.commit()
}

const restoreOriginalContent = async () => {
  if (saving.value) return

  saving.value = true
  inlineErrorMessage.value = ''

  try {
    const restored = normalizeContentForSave(deepClone(originalContent))

    await persistContent(restored)

    pageContent.value = restored
    updateSnapshot()
    collapseAll()

    openSuccessModal('Original QNA page content has been restored and saved successfully.')
  } catch (error) {
    console.error('Failed to restore QNA page content:', error)
    openErrorModal('Failed to restore original QNA page content. Please try again.')
  } finally {
    saving.value = false
  }
}

const migrateOldDataToSections = (data) => {
  if (Array.isArray(data.sections) && data.sections.length > 0) {
    return normalizeContentForSave(data)
  }

  const migrated = deepClone(originalContent)

  if (Array.isArray(data.qnaItems) && data.qnaItems.length > 0) {
    migrated.sections[0].items = data.qnaItems
  } else if (Array.isArray(data.items) && data.items.length > 0) {
    migrated.sections[0].items = data.items
  }

  if (data.foodSection) {
    migrated.sections[1].title = data.foodSection.title || migrated.sections[1].title
    migrated.sections[1].description =
      data.foodSection.description || migrated.sections[1].description
  }

  if (Array.isArray(data.avoidGroups) && data.avoidGroups.length > 0) {
    migrated.sections[1].items = data.avoidGroups
  }

  if (data.lifestyleSection) {
    migrated.sections[2].title = data.lifestyleSection.title || migrated.sections[2].title
    migrated.sections[2].description =
      data.lifestyleSection.description || migrated.sections[2].description
  }

  if (Array.isArray(data.lifestyleCards) && data.lifestyleCards.length > 0) {
    migrated.sections[2].items = data.lifestyleCards
  }

  return normalizeContentForSave(migrated)
}

const fetchContent = async () => {
  loading.value = true
  inlineErrorMessage.value = ''

  try {
    const qnaPageRef = doc(db, 'siteContent', 'qnaPage')
    const qnaPageSnap = await getDoc(qnaPageRef)

    if (qnaPageSnap.exists()) {
      pageContent.value = migrateOldDataToSections(qnaPageSnap.data())
    } else {
      const restored = normalizeContentForSave(deepClone(originalContent))
      await persistContent(restored)
      pageContent.value = restored
    }

    updateSnapshot()
    collapseAll()
  } catch (error) {
    console.error('Failed to fetch QNA page content:', error)
    inlineErrorMessage.value = 'Failed to load QNA page content.'
    openErrorModal('Failed to load QNA page content. Please refresh and try again.')
  } finally {
    loading.value = false
  }
}

const saveContent = async () => {
  saving.value = true
  inlineErrorMessage.value = ''

  const validationMessage = validateContent()

  if (validationMessage) {
    inlineErrorMessage.value = validationMessage
    openErrorModal(validationMessage)
    saving.value = false
    return
  }

  try {
    await persistContent(pageContent.value)

    pageContent.value = normalizeContentForSave(pageContent.value)
    updateSnapshot()
    collapseAll()

    openSuccessModal('Your QNA page content has been saved successfully and synced to the website.')
  } catch (error) {
    console.error('Failed to save QNA page content:', error)
    const message = 'Failed to save QNA page content. Please try again.'
    inlineErrorMessage.value = message
    openErrorModal(message)
  } finally {
    saving.value = false
  }
}

const handleBeforeUnload = (event) => {
  if (!hasUnsavedChanges.value) return
  event.preventDefault()
  event.returnValue = ''
}

onBeforeRouteLeave((to, from, next) => {
  if (!hasUnsavedChanges.value) {
    next()
    return
  }

  pendingLeaveTarget.value = to.fullPath
  openUnsavedModal()
  next(false)
})

onMounted(() => {
  fetchContent()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #cfdac8 0%, #faf7f2 38%, #f5dfe6 72%, #eed6df 100%);
  padding: 40px 20px 80px;
}

.admin-container {
  max-width: 1180px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 30px;
}

.badge {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(47, 91, 67, 0.1);
  color: #2f5b43;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.admin-header h1 {
  margin: 0 0 10px;
  color: #2d5a42;
  font-size: clamp(2.1rem, 4vw, 3.4rem);
  line-height: 1.05;
}

.desc {
  margin: 0;
  color: #5f7667;
  max-width: 760px;
  font-size: 1rem;
  line-height: 1.7;
}

.back-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 22px;
  background: #2f5b43;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(47, 91, 67, 0.18);
}

.admin-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(47, 91, 67, 0.08);
  border-radius: 30px;
  box-shadow: 0 22px 48px rgba(61, 77, 66, 0.12);
  padding: 28px;
}

.loading-text {
  text-align: center;
  color: #5f7667;
  padding: 50px 0;
  font-size: 1rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-bottom: 28px;
}

.toolbar-left h2 {
  margin: 0;
  color: #2f5b43;
  font-size: 2rem;
}

.toolbar-left p {
  margin: 8px 0 0;
  color: #6f8576;
  font-size: 1rem;
}

.toolbar-right {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.admin-section {
  border: 1px solid rgba(47, 91, 67, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.42);
  padding: 26px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.section-heading-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.section-drag-handle {
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 50%;
  background: #f2f4f1;
  color: #7e8d84;
  font-size: 1.25rem;
  line-height: 1;
  cursor: grab;
  flex-shrink: 0;
}

.section-summary-btn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0;
  text-align: left;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  cursor: pointer;
}

.section-kicker {
  display: inline-block;
  margin: 0 0 6px;
  color: #728778;
  font-size: 0.86rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.section-heading h3 {
  margin: 0;
  color: #2f5b43;
  font-size: 2rem;
  line-height: 1.1;
}

.section-subtitle {
  margin: 8px 0 0;
  color: #7a8b81;
  font-size: 0.95rem;
  line-height: 1.5;
}

.section-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.section-editor {
  margin-top: 24px;
}

.section-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.section-content-area {
  border-top: 1px solid rgba(47, 91, 67, 0.08);
  padding-top: 24px;
}

.sub-section-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.sub-section-header h4 {
  margin: 0;
  color: #2f5b43;
  font-size: 1.35rem;
}

.sub-section-header p {
  margin: 6px 0 0;
  color: #6f8576;
  font-size: 0.95rem;
}

.secondary-btn,
.save-btn,
.danger-btn,
.toggle-btn,
.back-btn,
.modal-btn,
.qna-summary-btn,
.mini-btn,
.read-more-btn {
  border: none;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    opacity 0.18s ease,
    box-shadow 0.18s ease;
}

.secondary-btn:hover,
.save-btn:hover,
.danger-btn:hover,
.toggle-btn:hover,
.back-btn:hover,
.modal-btn:hover,
.qna-summary-btn:hover,
.mini-btn:hover,
.read-more-btn:hover,
.section-summary-btn:hover {
  transform: translateY(-1px);
}

.secondary-btn:disabled,
.save-btn:disabled,
.danger-btn:disabled,
.toggle-btn:disabled,
.back-btn:disabled,
.modal-btn:disabled,
.mini-btn:disabled,
.read-more-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.secondary-btn {
  border-radius: 999px;
  padding: 13px 20px;
  background: #edf1ed;
  color: #2f5b43;
  font-weight: 700;
  font-size: 1rem;
}

.save-btn {
  border-radius: 999px;
  padding: 13px 22px;
  background: #2f6a45;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 12px 24px rgba(47, 106, 69, 0.16);
}

.error-text {
  margin: 0 0 18px;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 0.96rem;
  font-weight: 600;
  background: #fff0f2;
  color: #b55067;
  border: 1px solid #f1c6cf;
}

.empty-state {
  border: 1px dashed rgba(47, 91, 67, 0.2);
  background: rgba(249, 251, 248, 0.76);
  border-radius: 24px;
  padding: 46px 24px;
  text-align: center;
}

.empty-state p {
  margin: 0 0 18px;
  color: #6c8074;
  font-size: 1rem;
}

.qna-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.qna-block {
  border: 1px solid rgba(47, 91, 67, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.68);
  padding: 26px;
}

.qna-block-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 0;
}

.qna-header-left {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.drag-handle {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: #f2f4f1;
  color: #7e8d84;
  font-size: 1.2rem;
  line-height: 1;
  cursor: grab;
  flex-shrink: 0;
}

.drag-handle:active,
.section-drag-handle:active {
  cursor: grabbing;
}

.qna-summary-btn {
  flex: 1;
  background: transparent;
  padding: 0;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
}

.qna-summary-text {
  min-width: 0;
}

.qna-index {
  display: inline-block;
  color: #728778;
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.qna-summary-btn h3 {
  margin: 0;
  color: #2f5b43;
  font-size: 1.95rem;
  line-height: 1.2;
}

.qna-summary-subtitle {
  margin: 8px 0 0;
  color: #7a8b81;
  font-size: 0.95rem;
  line-height: 1.5;
}

.expand-icon {
  flex-shrink: 0;
  font-size: 1.2rem;
  color: #6d8074;
  transition: transform 0.22s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.qna-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.danger-btn {
  border-radius: 999px;
  padding: 11px 20px;
  background: #c35f77;
  color: #fff;
  font-weight: 700;
  font-size: 0.98rem;
}

.toggle-btn {
  min-width: 110px;
  border-radius: 999px;
  padding: 12px 18px;
  background: #eadfe2;
  color: #946274;
  font-weight: 700;
  font-size: 0.95rem;
}

.toggle-btn.active {
  background: #dff1e4;
  color: #2f7a47;
}

.qna-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.38fr) minmax(280px, 0.82fr);
  gap: 22px;
  align-items: start;
  margin-top: 24px;
}

.qna-grid.one-col {
  grid-template-columns: 1fr;
}

.form-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  color: #2f5b43;
  font-size: 0.98rem;
  font-weight: 700;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d5dfd7;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  padding: 14px 16px;
  color: #335846;
  font-size: 0.98rem;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    min-height 0.2s ease,
    max-height 0.2s ease;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  border-color: #7ba287;
  box-shadow: 0 0 0 4px rgba(72, 128, 88, 0.08);
}

.answer-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mini-btn {
  border-radius: 999px;
  padding: 8px 14px;
  background: rgba(47, 91, 67, 0.08);
  color: #2f5b43;
  font-size: 0.86rem;
  font-weight: 700;
}

.answer-textarea {
  resize: vertical;
  min-height: 112px;
  max-height: 112px;
  overflow-y: auto;
  line-height: 1.65;
}

.answer-textarea.expanded {
  min-height: 230px;
  max-height: 430px;
}

.helper-text {
  margin: -2px 0 0;
  color: #7a8b81;
  font-size: 0.9rem;
  line-height: 1.5;
}

.preview-side {
  position: sticky;
  top: 24px;
}

.preview-card {
  overflow: hidden;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(47, 91, 67, 0.08);
  box-shadow: 0 14px 26px rgba(50, 66, 55, 0.06);
}

.preview-body {
  padding: 18px 18px 20px;
}

.preview-role-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  margin: 0 0 12px;
  border-radius: 999px;
  background: #eef3ec;
  color: #5d7a66;
  font-size: 0.84rem;
  font-weight: 700;
}

.preview-body h4 {
  margin: 0 0 12px;
  color: #2f5b43;
  font-size: 1.12rem;
  line-height: 1.35;
}

.preview-answer-wrap {
  position: relative;
  margin-bottom: 10px;
}

.preview-answer {
  color: #60776b;
  font-size: 0.94rem;
  line-height: 1.72;
}

.preview-answer p {
  margin: 0 0 10px;
}

.preview-answer p:last-child {
  margin-bottom: 0;
}

.preview-answer.collapsed {
  max-height: 140px;
  overflow: hidden;
}

.preview-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.9) 42%,
    rgba(255, 255, 255, 1) 100%
  );
}

.read-more-btn {
  background: transparent;
  padding: 0;
  color: #2f5b43;
  font-size: 0.9rem;
  font-weight: 700;
}

.preview-placeholder {
  color: #8a978f;
  font-style: italic;
}

.multiline-text {
  white-space: pre-line;
}

.bottom-action-row {
  margin-top: 28px;
  display: flex;
  justify-content: flex-end;
}

.drag-ghost {
  opacity: 0.55;
}

.drag-chosen {
  transform: scale(0.995);
}

.floating-save-bar {
  position: sticky;
  bottom: 18px;
  z-index: 80;
  margin-top: 26px;
  margin-left: auto;
  width: fit-content;
  max-width: min(100%, 620px);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px 14px 20px;
  border: 1px solid rgba(47, 91, 67, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  box-shadow: 0 18px 44px rgba(47, 91, 67, 0.16);
}

.floating-save-text {
  color: #6f8576;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 44, 38, 0.28);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 9999;
}

.modal-card {
  width: 100%;
  max-width: 460px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(47, 91, 67, 0.08);
  border-radius: 28px;
  box-shadow: 0 24px 60px rgba(47, 91, 67, 0.16);
  padding: 30px 26px 24px;
  text-align: center;
}

.preview-modal-card {
  max-width: 720px;
  text-align: left;
}

.success-modal-card {
  border-color: rgba(47, 122, 71, 0.12);
}

.error-modal-card {
  border-color: rgba(181, 80, 103, 0.16);
}

.modal-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.9rem;
  font-weight: 800;
}

.success-icon {
  background: #e7f5ea;
  color: #2f7a47;
}

.error-icon {
  background: #fdecef;
  color: #b55067;
}

.neutral-icon {
  background: #f2f4f1;
  color: #62756a;
}

.modal-card h3 {
  margin: 0 0 10px;
  color: #2f5b43;
  font-size: 1.55rem;
}

.modal-card p {
  margin: 0;
  color: #6a7d71;
  line-height: 1.7;
  font-size: 1rem;
}

.preview-modal-content {
  max-height: 55vh;
  overflow-y: auto;
  margin-top: 16px;
  padding-right: 6px;
}

.preview-modal-content p {
  margin: 0 0 14px;
  color: #60776b;
  line-height: 1.8;
}

.modal-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.modal-actions.center {
  justify-content: center;
}

.modal-btn {
  border-radius: 999px;
  padding: 13px 22px;
  font-size: 0.98rem;
  font-weight: 700;
}

.modal-btn.primary {
  background: #2f6a45;
  color: #fff;
}

.modal-btn.secondary {
  background: #edf1ed;
  color: #2f5b43;
}

.modal-btn.danger {
  background: #c35f77;
  color: #fff;
}

@media (max-width: 1024px) {
  .qna-grid,
  .section-form {
    grid-template-columns: 1fr;
  }

  .preview-side {
    position: static;
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 28px 14px 60px;
  }

  .admin-card {
    padding: 20px;
    border-radius: 22px;
  }

  .admin-header,
  .toolbar,
  .qna-block-header,
  .section-heading,
  .sub-section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-right,
  .qna-actions,
  .section-actions,
  .bottom-action-row {
    justify-content: flex-start;
  }

  .qna-header-left,
  .section-heading-left {
    width: 100%;
  }

  .qna-block,
  .admin-section {
    padding: 20px;
    border-radius: 22px;
  }

  .qna-summary-btn h3,
  .toolbar-left h2,
  .section-heading h3 {
    font-size: 1.55rem;
  }

  .modal-card {
    padding: 24px 18px 20px;
    border-radius: 22px;
  }

  .modal-card h3 {
    font-size: 1.35rem;
  }

  .floating-save-bar {
    width: auto;
    margin-left: 0;
    border-radius: 24px;
    align-items: stretch;
    flex-direction: column;
  }

  .floating-save-text {
    font-size: 0.85rem;
  }

  .floating-save-bar .save-btn {
    width: 100%;
  }

  .answer-textarea {
    min-height: 96px;
    max-height: 96px;
  }

  .answer-textarea.expanded {
    min-height: 180px;
    max-height: 320px;
  }
}
</style>
