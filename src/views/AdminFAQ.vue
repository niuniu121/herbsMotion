<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <p class="badge">Admin Panel</p>
          <h1>FAQ Management</h1>
          <p class="desc">Manage frequently asked questions for the website.</p>
        </div>

        <button class="back-btn" @click="handleBackClick">Back</button>
      </div>

      <div class="admin-card">
        <div v-if="loading" class="loading-text">Loading FAQ content...</div>

        <div v-else class="content-wrap">
          <div class="toolbar">
            <div class="toolbar-left">
              <h2>FAQ Items</h2>
              <p>Add, edit, reorder and control the visibility of FAQ items.</p>
            </div>

            <div class="toolbar-right">
              <button class="secondary-btn" @click="addFaq" type="button">+ Add FAQ</button>

              <button class="save-btn" @click="saveFaqs" :disabled="saving" type="button">
                {{ saving ? 'Saving...' : 'Save FAQs' }}
              </button>
            </div>
          </div>

          <p v-if="inlineErrorMessage" class="error-text">{{ inlineErrorMessage }}</p>

          <div v-if="faqs.length === 0" class="empty-state">
            <p>No FAQ items yet.</p>
            <button class="secondary-btn" @click="addFaq" type="button">Create First FAQ</button>
          </div>

          <draggable
            v-else
            v-model="faqs"
            item-key="id"
            handle=".drag-handle"
            animation="220"
            ghost-class="drag-ghost"
            chosen-class="drag-chosen"
            class="faq-list"
          >
            <template #item="{ element: faq, index }">
              <div class="faq-block" :id="faq.id">
                <div class="faq-block-header">
                  <div class="faq-header-left">
                    <button class="drag-handle" type="button" title="Drag to reorder">⋮⋮</button>

                    <button class="faq-summary-btn" type="button" @click="toggleFaq(faq.id)">
                      <div class="faq-summary-text">
                        <span class="faq-index">FAQ {{ index + 1 }}</span>
                        <h3>{{ faq.question || 'New FAQ Item' }}</h3>
                        <p class="faq-summary-subtitle">
                          {{ faq.visible ? 'Visible on website' : 'Hidden from website' }}
                          <span v-if="faq.answer"> · {{ getAnswerPreview(faq.answer) }} </span>
                        </p>
                      </div>

                      <span class="expand-icon" :class="{ expanded: isExpanded(faq.id) }">▾</span>
                    </button>
                  </div>

                  <div class="faq-actions">
                    <button
                      class="toggle-btn"
                      :class="{ active: faq.visible }"
                      @click="faq.visible = !faq.visible"
                      type="button"
                    >
                      {{ faq.visible ? 'Visible' : 'Hidden' }}
                    </button>

                    <button
                      class="danger-btn"
                      type="button"
                      @click="askRemoveFaq(index)"
                      :disabled="deleting"
                    >
                      {{ deleting && deleteModal.index === index ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
                </div>

                <div v-if="isExpanded(faq.id)" class="faq-grid">
                  <div class="form-side">
                    <div class="form-group">
                      <label>Question</label>
                      <input
                        v-model.trim="faq.question"
                        type="text"
                        placeholder="Enter FAQ question"
                      />
                    </div>

                    <div class="form-group">
                      <div class="answer-label-row">
                        <label>Answer</label>
                        <button
                          type="button"
                          class="mini-btn"
                          @click="faq.answerExpanded = !faq.answerExpanded"
                        >
                          {{ faq.answerExpanded ? 'Collapse' : 'Edit answer' }}
                        </button>
                      </div>

                      <textarea
                        v-model="faq.answer"
                        class="answer-textarea"
                        :class="{ expanded: faq.answerExpanded }"
                        rows="8"
                        placeholder="Enter FAQ answer here. Press Enter for a new paragraph or a new line."
                      ></textarea>

                      <p class="helper-text">
                        Line breaks will be preserved on the front-end FAQ page.
                      </p>
                    </div>
                  </div>

                  <div class="preview-side">
                    <div class="preview-card">
                      <div class="preview-body">
                        <p class="preview-role-badge">FAQ Preview</p>

                        <h4>{{ faq.question || 'Your FAQ question will appear here.' }}</h4>

                        <div class="preview-answer-wrap">
                          <div
                            class="preview-answer multiline-text"
                            :class="{ collapsed: shouldShowPreviewToggle(faq.answer) }"
                          >
                            <p v-for="(paragraph, pIndex) in parseAnswer(faq.answer)" :key="pIndex">
                              {{ paragraph }}
                            </p>

                            <p v-if="!parseAnswer(faq.answer).length" class="preview-placeholder">
                              Your answer preview will appear here.
                            </p>
                          </div>

                          <div
                            v-if="
                              shouldShowPreviewToggle(faq.answer) && parseAnswer(faq.answer).length
                            "
                            class="preview-fade"
                          ></div>
                        </div>

                        <button
                          v-if="
                            shouldShowPreviewToggle(faq.answer) && parseAnswer(faq.answer).length
                          "
                          type="button"
                          class="read-more-btn"
                          @click="openPreviewModal(faq)"
                        >
                          Read more
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </draggable>

          <div v-if="faqs.length > 0" class="bottom-action-row">
            <button class="save-btn" @click="saveFaqs" :disabled="saving" type="button">
              {{ saving ? 'Saving...' : 'Save FAQs' }}
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
          <button class="modal-btn primary" @click="closeSuccessModal" type="button">OK</button>
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
          <button class="modal-btn danger" @click="closeErrorModal" type="button">OK</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="deleteModal.open" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-card">
        <div class="modal-icon neutral-icon">?</div>
        <h3>Delete FAQ Item</h3>
        <p>
          Are you sure you want to delete
          <strong>{{ deleteModal.question || 'this FAQ item' }}</strong
          >? This will be removed immediately and synced to the website and chatbot.
        </p>
        <div class="modal-actions">
          <button
            class="modal-btn secondary"
            @click="closeDeleteModal"
            type="button"
            :disabled="deleting"
          >
            Cancel
          </button>
          <button
            class="modal-btn danger"
            @click="confirmRemoveFaq"
            type="button"
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
          <button class="modal-btn secondary" @click="closeUnsavedModal" type="button">
            Stay Here
          </button>
          <button class="modal-btn danger" @click="confirmLeavePage" type="button">
            Leave Anyway
          </button>
        </div>
      </div>
    </div>

    <!-- FAQ Preview Modal -->
    <div v-if="previewModal.open" class="modal-overlay" @click.self="closePreviewModal">
      <div class="modal-card preview-modal-card">
        <div class="modal-icon neutral-icon">i</div>
        <h3>{{ previewModal.question || 'FAQ Preview' }}</h3>
        <div class="preview-modal-content">
          <p v-for="(paragraph, pIndex) in parseAnswer(previewModal.answer)" :key="pIndex">
            {{ paragraph }}
          </p>
        </div>
        <div class="modal-actions center">
          <button class="modal-btn primary" @click="closePreviewModal" type="button">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import draggable from 'vuedraggable'
import { doc, getDoc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { db } from '@/firebase'

const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const inlineErrorMessage = ref('')
const faqs = ref([])
const expandedFaqIds = ref([])
const lastSavedSnapshot = ref('[]')
const pendingLeaveTarget = ref(null)

const successModal = ref({
  open: false,
  title: 'Saved Successfully',
  message: 'Your FAQ content has been updated.',
})

const errorModal = ref({
  open: false,
  title: 'Something Went Wrong',
  message: '',
})

const deleteModal = ref({
  open: false,
  index: null,
  question: '',
})

const unsavedModal = ref({
  open: false,
})

const previewModal = ref({
  open: false,
  question: '',
  answer: '',
})

const createEmptyFaq = () => ({
  id: `faq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  question: '',
  answer: '',
  visible: true,
  answerExpanded: false,
})

const normalizeFaqsForSave = (list) =>
  list.map((item) => ({
    id: item.id,
    question: item.question || '',
    answer: item.answer || '',
    visible: item.visible ?? true,
  }))

const currentSnapshot = computed(() => JSON.stringify(normalizeFaqsForSave(faqs.value)))
const hasUnsavedChanges = computed(() => currentSnapshot.value !== lastSavedSnapshot.value)

const updateSnapshot = () => {
  lastSavedSnapshot.value = JSON.stringify(normalizeFaqsForSave(faqs.value))
}

const isExpanded = (faqId) => expandedFaqIds.value.includes(faqId)

const toggleFaq = (faqId) => {
  if (isExpanded(faqId)) {
    expandedFaqIds.value = expandedFaqIds.value.filter((id) => id !== faqId)
  } else {
    expandedFaqIds.value.push(faqId)
  }
}

const expandFaq = (faqId) => {
  if (!expandedFaqIds.value.includes(faqId)) {
    expandedFaqIds.value.push(faqId)
  }
}

const collapseAllFaqs = () => {
  expandedFaqIds.value = []
}

const parseAnswer = (value) => {
  if (!value) return []
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

const getAnswerPreview = (value) => {
  if (!value) return 'No answer yet'
  const singleLine = value.replace(/\s+/g, ' ').trim()
  return singleLine.length > 88 ? `${singleLine.slice(0, 88)}...` : singleLine
}

const shouldShowPreviewToggle = (value) => {
  if (!value) return false
  return value.length > 220 || value.includes('\n')
}

const openPreviewModal = (faq) => {
  previewModal.value = {
    open: true,
    question: faq.question || 'FAQ Preview',
    answer: faq.answer || '',
  }
}

const closePreviewModal = () => {
  previewModal.value.open = false
}

const openSuccessModal = (message = 'Your FAQ content has been updated.') => {
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

const askRemoveFaq = (index) => {
  deleteModal.value = {
    open: true,
    index,
    question: faqs.value[index]?.question || '',
  }
}

const closeDeleteModal = () => {
  if (deleting.value) return
  deleteModal.value = {
    open: false,
    index: null,
    question: '',
  }
}

const persistFaqs = async (list) => {
  const normalizedItems = normalizeFaqsForSave(list)

  const faqRef = doc(db, 'siteContent', 'faq')
  const chatbotFaqRef = doc(db, 'siteContent', 'chatbotFAQ')

  const batch = writeBatch(db)

  batch.set(
    faqRef,
    {
      items: normalizedItems,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  batch.set(
    chatbotFaqRef,
    {
      items: normalizedItems,
      quickQuestions: normalizedItems
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

const confirmRemoveFaq = async () => {
  if (deleteModal.value.index === null || deleting.value) return

  deleting.value = true
  inlineErrorMessage.value = ''

  const removeIndex = deleteModal.value.index
  const nextFaqs = [...faqs.value]
  const removedFaq = nextFaqs[removeIndex]

  nextFaqs.splice(removeIndex, 1)

  try {
    await persistFaqs(nextFaqs)

    faqs.value = nextFaqs

    if (removedFaq?.id) {
      expandedFaqIds.value = expandedFaqIds.value.filter((id) => id !== removedFaq.id)
    }

    updateSnapshot()

    deleteModal.value = {
      open: false,
      index: null,
      question: '',
    }

    openSuccessModal('FAQ deleted successfully and synced to the website and chatbot.')
  } catch (error) {
    console.error('Failed to delete FAQ:', error)
    openErrorModal('Failed to delete this FAQ item. Please try again.')
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

const addFaq = async () => {
  const newFaq = createEmptyFaq()
  faqs.value.push(newFaq)
  expandFaq(newFaq.id)

  await nextTick()

  const el = document.getElementById(newFaq.id)
  if (el) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }
}

const fetchFaqs = async () => {
  loading.value = true
  inlineErrorMessage.value = ''

  try {
    const docRef = doc(db, 'siteContent', 'faq')
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      faqs.value =
        Array.isArray(data.items) && data.items.length
          ? data.items.map((item, idx) => ({
              id: item.id || `faq_${idx}_${Date.now()}`,
              question: item.question || '',
              answer: item.answer || '',
              visible: item.visible ?? true,
              answerExpanded: false,
            }))
          : []
    } else {
      faqs.value = []
    }

    updateSnapshot()
    expandedFaqIds.value = []
  } catch (error) {
    console.error('Failed to fetch FAQs:', error)
    inlineErrorMessage.value = 'Failed to load FAQ content.'
    openErrorModal('Failed to load FAQ content. Please refresh and try again.')
  } finally {
    loading.value = false
  }
}

const saveFaqs = async () => {
  saving.value = true
  inlineErrorMessage.value = ''

  const invalidItem = faqs.value.find((item) => !item.question.trim() || !item.answer.trim())

  if (invalidItem) {
    const message = 'Each FAQ item must have both a question and an answer.'
    inlineErrorMessage.value = message
    openErrorModal(message)
    saving.value = false
    return
  }

  try {
    await persistFaqs(faqs.value)

    updateSnapshot()
    collapseAllFaqs()
    openSuccessModal('Your FAQ content has been saved successfully and synced to the chatbot.')
  } catch (error) {
    console.error('Failed to save FAQs:', error)
    const message = 'Failed to save FAQ content. Please try again.'
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
  fetchFaqs()
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

.secondary-btn,
.save-btn,
.danger-btn,
.toggle-btn,
.back-btn,
.modal-btn,
.faq-summary-btn,
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
.faq-summary-btn:hover,
.mini-btn:hover,
.read-more-btn:hover {
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

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.faq-block {
  border: 1px solid rgba(47, 91, 67, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.68);
  padding: 26px;
}

.faq-block-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 0;
}

.faq-header-left {
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

.drag-handle:active {
  cursor: grabbing;
}

.faq-summary-btn {
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

.faq-summary-text {
  min-width: 0;
}

.faq-index {
  display: inline-block;
  color: #728778;
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.faq-summary-btn h3 {
  margin: 0;
  color: #2f5b43;
  font-size: 1.95rem;
  line-height: 1.2;
}

.faq-summary-subtitle {
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

.faq-actions {
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

.faq-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.38fr) minmax(280px, 0.82fr);
  gap: 22px;
  align-items: start;
  margin-top: 24px;
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

.form-group input:focus,
.form-group textarea:focus {
  border-color: #7ba287;
  box-shadow: 0 0 0 4px rgba(72, 128, 88, 0.08);
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
  .faq-grid {
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
  .faq-block-header {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-right,
  .faq-actions,
  .bottom-action-row {
    justify-content: flex-start;
  }

  .faq-header-left {
    width: 100%;
  }

  .faq-block {
    padding: 20px;
    border-radius: 22px;
  }

  .faq-summary-btn h3,
  .toolbar-left h2 {
    font-size: 1.55rem;
  }

  .modal-card {
    padding: 24px 18px 20px;
    border-radius: 22px;
  }

  .modal-card h3 {
    font-size: 1.35rem;
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
