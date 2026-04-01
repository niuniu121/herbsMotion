<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="admin-header">
        <div>
          <p class="badge">Admin Panel</p>
          <h1>Our Team Management</h1>
          <p class="desc">
            Manage practitioner profiles, images, bios and visibility for the Our Team page.
          </p>
        </div>

        <button class="back-btn" @click="handleBackClick">Back</button>
      </div>

      <div class="admin-card">
        <div v-if="loading" class="loading-text">Loading team content...</div>

        <div v-else class="content-wrap">
          <div class="toolbar">
            <div class="toolbar-left">
              <h2>Team Members</h2>
              <p>Edit your practitioner profiles below.</p>
            </div>

            <div class="toolbar-right">
              <button class="secondary-btn" @click="addMember" type="button">+ Add Member</button>

              <button class="save-btn" @click="saveTeam" :disabled="saving" type="button">
                {{ saving ? 'Saving...' : 'Save Team' }}
              </button>
            </div>
          </div>

          <p v-if="inlineErrorMessage" class="error-text">{{ inlineErrorMessage }}</p>

          <div v-if="members.length === 0" class="empty-state">
            <p>No team members yet.</p>
            <button class="secondary-btn" @click="addMember" type="button">
              Create First Member
            </button>
          </div>

          <draggable
            v-else
            v-model="members"
            item-key="id"
            handle=".drag-handle"
            animation="220"
            ghost-class="drag-ghost"
            chosen-class="drag-chosen"
            class="members-list"
          >
            <template #item="{ element: member, index }">
              <div class="member-block">
                <div class="member-block-header">
                  <div class="member-header-left">
                    <button class="drag-handle" type="button" title="Drag to reorder">⋮⋮</button>

                    <button
                      class="member-summary-btn"
                      type="button"
                      @click="toggleMember(member.id)"
                    >
                      <div class="member-summary-text">
                        <span class="member-index">Member {{ index + 1 }}</span>
                        <h3>{{ member.name || 'New Team Member' }}</h3>

                        <p v-if="formattedRoles(member).length" class="member-inline-roles">
                          {{ formattedRoles(member).join(' / ') }}
                        </p>

                        <p class="member-summary-subtitle">
                          {{ member.visible ? 'Visible on website' : 'Hidden from website' }}
                        </p>
                      </div>

                      <span class="expand-icon" :class="{ expanded: isExpanded(member.id) }">
                        ▾
                      </span>
                    </button>
                  </div>

                  <div class="member-actions">
                    <button class="danger-btn" type="button" @click="askRemoveMember(index)">
                      Delete
                    </button>
                  </div>
                </div>

                <div v-if="isExpanded(member.id)" class="member-grid">
                  <div class="form-side">
                    <div class="form-group">
                      <label>Name</label>
                      <input v-model="member.name" type="text" placeholder="e.g. Sophia Chan" />
                    </div>

                    <div class="form-group">
                      <div class="role-label-row">
                        <label>Roles / Titles</label>
                        <button class="add-role-btn" type="button" @click="addRole(member)">
                          + Add
                        </button>
                      </div>

                      <div class="roles-editor">
                        <div
                          v-for="(role, roleIndex) in member.roles"
                          :key="`${member.id}-role-${roleIndex}`"
                          class="role-input-row"
                        >
                          <input
                            v-model="member.roles[roleIndex]"
                            type="text"
                            placeholder="e.g. Senior TCM Practitioner"
                          />
                          <button
                            class="remove-role-btn"
                            type="button"
                            @click="removeRole(member, roleIndex)"
                            title="Remove role"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      <p class="helper-text">
                        Add as many roles as you like. They will display beside the name and be
                        separated by / automatically.
                      </p>
                    </div>

                    <div class="form-group">
                      <label>Profile Image URL</label>
                      <input
                        v-model.trim="member.image"
                        type="text"
                        placeholder="Paste direct image URL here"
                        @input="resetImageError(member)"
                      />
                      <p class="helper-text">
                        Please use a direct image URL ending in .jpg, .jpeg, .png or .webp. Imgur
                        album/page links will not work.
                      </p>
                      <p v-if="member.image && !isDirectImageUrl(member.image)" class="field-error">
                        This does not look like a direct image URL.
                      </p>
                    </div>

                    <div class="form-group">
                      <label>Qualifications</label>
                      <textarea
                        v-model="member.qualifications"
                        rows="5"
                        placeholder="One item per line"
                      ></textarea>
                    </div>

                    <div class="form-group">
                      <label>Education</label>
                      <textarea
                        v-model="member.education"
                        rows="5"
                        placeholder="One item per line"
                      ></textarea>
                    </div>

                    <div class="form-group">
                      <label>Services</label>
                      <textarea
                        v-model="member.services"
                        rows="5"
                        placeholder="One item per line"
                      ></textarea>
                    </div>

                    <div class="form-group">
                      <label>Areas of Special Interest</label>
                      <textarea
                        v-model="member.interests"
                        rows="6"
                        placeholder="One item per line"
                      ></textarea>
                    </div>

                    <div class="form-group">
                      <label>About</label>
                      <textarea
                        v-model="member.about"
                        rows="10"
                        placeholder="Write practitioner introduction here"
                      ></textarea>
                    </div>

                    <div class="toggle-row">
                      <div>
                        <h4>Visible on website</h4>
                        <p>Control whether this practitioner appears on the Our Team page.</p>
                      </div>

                      <button
                        class="toggle-btn"
                        :class="{ active: member.visible }"
                        @click="member.visible = !member.visible"
                        type="button"
                      >
                        {{ member.visible ? 'Visible' : 'Hidden' }}
                      </button>
                    </div>
                  </div>

                  <div class="preview-side">
                    <div class="preview-card">
                      <div class="preview-image-wrap">
                        <img
                          v-if="member.image && !member.imageError"
                          :src="member.image"
                          :alt="member.name || 'Team member image'"
                          class="preview-image"
                          @error="member.imageError = true"
                        />
                        <div v-else class="preview-placeholder">
                          {{
                            member.image
                              ? 'Invalid image URL. Please use a direct image link.'
                              : 'Image Preview'
                          }}
                        </div>
                      </div>

                      <div class="preview-body">
                        <p class="preview-role-badge">Practitioner</p>

                        <div class="preview-name-row">
                          <h4>{{ member.name || 'New Team Member' }}</h4>
                          <span v-if="formattedRoles(member).length" class="preview-inline-roles">
                            {{ formattedRoles(member).join(' / ') }}
                          </span>
                        </div>

                        <div class="preview-about multiline-text">
                          {{ member.about || 'Practitioner bio preview will appear here.' }}
                        </div>

                        <div class="preview-section" v-if="member.qualifications">
                          <h5>Qualifications</h5>
                          <p class="multiline-text">{{ member.qualifications }}</p>
                        </div>

                        <div class="preview-section" v-if="member.education">
                          <h5>Education</h5>
                          <p class="multiline-text">{{ member.education }}</p>
                        </div>

                        <div class="preview-section" v-if="member.services">
                          <h5>Services</h5>
                          <p class="multiline-text">{{ member.services }}</p>
                        </div>

                        <div class="preview-section" v-if="member.interests">
                          <h5>Special Interests</h5>
                          <p class="multiline-text">{{ member.interests }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </draggable>

          <div v-if="members.length > 0" class="bottom-action-row">
            <button class="save-btn" @click="saveTeam" :disabled="saving" type="button">
              {{ saving ? 'Saving...' : 'Save Team' }}
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
        <h3>Delete Team Member</h3>
        <p>
          This will remove
          <strong>{{ deleteModal.memberName || 'this member' }}</strong>
          from the current form. This action cannot be undone after saving.
        </p>
        <div class="modal-actions">
          <button class="modal-btn secondary" @click="closeDeleteModal" type="button">
            Cancel
          </button>
          <button class="modal-btn danger" @click="confirmRemoveMember" type="button">
            Delete
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
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import draggable from 'vuedraggable'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { db } from '@/firebase'

const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const inlineErrorMessage = ref('')
const members = ref([])
const expandedMemberIds = ref([])
const lastSavedSnapshot = ref('[]')
const pendingLeaveTarget = ref(null)

const successModal = ref({
  open: false,
  title: 'Saved Successfully',
  message: 'Your Our Team content has been updated.',
})

const errorModal = ref({
  open: false,
  title: 'Something Went Wrong',
  message: '',
})

const deleteModal = ref({
  open: false,
  index: null,
  memberName: '',
})

const unsavedModal = ref({
  open: false,
})

const sanitizeRoles = (roles) => {
  if (!Array.isArray(roles)) return []
  return roles.map((item) => String(item || '').trim()).filter(Boolean)
}

const formattedRoles = (member) => sanitizeRoles(member.roles)

const createEmptyMember = () => ({
  id: `member_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  name: '',
  roles: [''],
  image: '',
  imageError: false,
  qualifications: '',
  education: '',
  services: '',
  interests: '',
  about: '',
  visible: true,
})

const normalizeMembersForSave = (list) =>
  list.map((member) => ({
    id: member.id,
    name: member.name || '',
    roles: sanitizeRoles(member.roles),
    image: member.image || '',
    qualifications: member.qualifications || '',
    education: member.education || '',
    services: member.services || '',
    interests: member.interests || '',
    about: member.about || '',
    visible: member.visible ?? true,
  }))

const currentSnapshot = computed(() => JSON.stringify(normalizeMembersForSave(members.value)))
const hasUnsavedChanges = computed(() => currentSnapshot.value !== lastSavedSnapshot.value)

const updateSnapshot = () => {
  lastSavedSnapshot.value = JSON.stringify(normalizeMembersForSave(members.value))
}

const isExpanded = (memberId) => expandedMemberIds.value.includes(memberId)

const toggleMember = (memberId) => {
  if (isExpanded(memberId)) {
    expandedMemberIds.value = expandedMemberIds.value.filter((id) => id !== memberId)
  } else {
    expandedMemberIds.value.push(memberId)
  }
}

const expandMember = (memberId) => {
  if (!expandedMemberIds.value.includes(memberId)) {
    expandedMemberIds.value.push(memberId)
  }
}

const collapseAllMembers = () => {
  expandedMemberIds.value = []
}

const openSuccessModal = (message = 'Your Our Team content has been updated.') => {
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

const askRemoveMember = (index) => {
  deleteModal.value = {
    open: true,
    index,
    memberName: members.value[index]?.name || '',
  }
}

const closeDeleteModal = () => {
  deleteModal.value = {
    open: false,
    index: null,
    memberName: '',
  }
}

const confirmRemoveMember = () => {
  if (deleteModal.value.index !== null) {
    const removedMember = members.value[deleteModal.value.index]
    members.value.splice(deleteModal.value.index, 1)
    if (removedMember?.id) {
      expandedMemberIds.value = expandedMemberIds.value.filter((id) => id !== removedMember.id)
    }
  }
  closeDeleteModal()
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

const addMember = () => {
  const newMember = createEmptyMember()
  members.value.push(newMember)
  expandMember(newMember.id)
}

const addRole = (member) => {
  if (!Array.isArray(member.roles)) {
    member.roles = ['']
    return
  }
  member.roles.push('')
}

const removeRole = (member, roleIndex) => {
  if (!Array.isArray(member.roles)) {
    member.roles = ['']
    return
  }

  member.roles.splice(roleIndex, 1)

  if (member.roles.length === 0) {
    member.roles.push('')
  }
}

const isDirectImageUrl = (url) => {
  if (!url) return true

  const trimmed = url.trim().toLowerCase()

  const hasValidExtension = /\.(jpg|jpeg|png|webp)(\?.*)?$/.test(trimmed)

  const isImgurAlbumOrPage =
    trimmed.includes('imgur.com/a/') ||
    trimmed.includes('imgur.com/gallery/') ||
    (/imgur\.com\/[^./?]+\/?$/.test(trimmed) && !trimmed.includes('i.imgur.com/'))

  return hasValidExtension && !isImgurAlbumOrPage
}

const resetImageError = (member) => {
  member.imageError = false
}

const fetchTeam = async () => {
  loading.value = true
  inlineErrorMessage.value = ''

  try {
    const docRef = doc(db, 'siteContent', 'ourTeam')
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      members.value =
        Array.isArray(data.members) && data.members.length
          ? data.members.map((item, idx) => ({
              id: item.id || `member_${idx}_${Date.now()}`,
              name: item.name || '',
              roles: Array.isArray(item.roles) ? item.roles : item.role ? [item.role] : [''],
              image: item.image || '',
              imageError: false,
              qualifications: item.qualifications || '',
              education: item.education || '',
              services: item.services || '',
              interests: item.interests || '',
              about: item.about || '',
              visible: item.visible ?? true,
            }))
          : []
    } else {
      members.value = []
    }

    updateSnapshot()
    expandedMemberIds.value = []
  } catch (error) {
    console.error('Failed to fetch team:', error)
    inlineErrorMessage.value = 'Failed to load team content.'
    openErrorModal('Failed to load team content. Please refresh and try again.')
  } finally {
    loading.value = false
  }
}

const saveTeam = async () => {
  saving.value = true
  inlineErrorMessage.value = ''

  const invalidMember = members.value.find(
    (member) => member.image && !isDirectImageUrl(member.image),
  )

  if (invalidMember) {
    const message =
      'One or more profile image URLs are invalid. Please use a direct image URL ending in .jpg, .jpeg, .png or .webp.'
    inlineErrorMessage.value = message
    openErrorModal(message)
    saving.value = false
    return
  }

  try {
    const docRef = doc(db, 'siteContent', 'ourTeam')

    await setDoc(docRef, {
      members: normalizeMembersForSave(members.value),
      updatedAt: serverTimestamp(),
    })

    updateSnapshot()
    collapseAllMembers()
    openSuccessModal('Your Our Team content has been saved successfully.')
  } catch (error) {
    console.error('Failed to save team:', error)
    const message = 'Failed to save team content. Please try again.'
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
  fetchTeam()
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
.member-summary-btn,
.add-role-btn,
.remove-role-btn {
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
.member-summary-btn:hover,
.add-role-btn:hover,
.remove-role-btn:hover {
  transform: translateY(-1px);
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

.members-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.member-block {
  border: 1px solid rgba(47, 91, 67, 0.08);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.68);
  padding: 26px;
}

.member-block-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 0;
}

.member-header-left {
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

.member-summary-btn {
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

.member-summary-text {
  min-width: 0;
}

.member-index {
  display: inline-block;
  color: #728778;
  font-size: 0.92rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.member-summary-btn h3 {
  margin: 0;
  color: #2f5b43;
  font-size: 1.95rem;
  line-height: 1.2;
}

.member-inline-roles {
  margin: 8px 0 0;
  color: #7a8b81;
  font-size: 0.94rem;
  line-height: 1.6;
  font-style: italic;
}

.member-summary-subtitle {
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

.member-actions {
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

.member-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.95fr);
  gap: 28px;
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

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #d5dfd7;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  padding: 16px 18px;
  color: #335846;
  font-size: 1rem;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #7ba287;
  box-shadow: 0 0 0 4px rgba(72, 128, 88, 0.08);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.65;
}

.role-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.roles-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-input-row input {
  flex: 1;
}

.add-role-btn {
  border-radius: 999px;
  padding: 8px 14px;
  background: #edf1ed;
  color: #2f5b43;
  font-size: 0.9rem;
  font-weight: 700;
}

.remove-role-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #f6e9ed;
  color: #b55067;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.helper-text {
  margin: -2px 0 0;
  color: #7a8b81;
  font-size: 0.9rem;
  line-height: 1.5;
}

.field-error {
  margin: -2px 0 0;
  color: #b55067;
  font-size: 0.92rem;
  font-weight: 600;
}

.toggle-row {
  margin-top: 4px;
  padding: 18px 20px;
  border-radius: 20px;
  background: #f6f8f5;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
}

.toggle-row h4 {
  margin: 0 0 6px;
  color: #355b47;
  font-size: 1rem;
}

.toggle-row p {
  margin: 0;
  color: #789081;
  font-size: 0.95rem;
  line-height: 1.55;
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

.preview-side {
  position: sticky;
  top: 24px;
}

.preview-card {
  overflow: hidden;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(47, 91, 67, 0.08);
  box-shadow: 0 18px 32px rgba(50, 66, 55, 0.08);
}

.preview-image-wrap {
  height: 345px;
  background: linear-gradient(180deg, #edf4e7 0%, #f7f6f2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  padding: 24px;
  color: #7e8f84;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.6;
}

.preview-body {
  padding: 22px 22px 24px;
  max-height: 640px;
  overflow-y: auto;
}

.preview-role-badge {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  margin: 0 0 14px;
  border-radius: 999px;
  background: #eef3ec;
  color: #5d7a66;
  font-size: 0.92rem;
  font-weight: 700;
}

.preview-name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-bottom: 12px;
}

.preview-body h4 {
  margin: 0;
  color: #2f5b43;
  font-size: 1.8rem;
  line-height: 1.2;
}

.preview-inline-roles {
  font-size: 0.95rem;
  font-style: italic;
  color: #7a8b81;
  font-weight: 500;
  line-height: 1.5;
}

.preview-about {
  margin: 0;
}

.preview-section {
  margin-top: 18px;
}

.preview-section h5 {
  margin: 0 0 8px;
  color: #385f4a;
  font-size: 0.98rem;
}

.multiline-text {
  margin: 0;
  color: #60776b;
  font-size: 0.96rem;
  line-height: 1.85;
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
  .member-grid {
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
  .member-block-header,
  .toggle-row,
  .role-label-row {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-right,
  .member-actions,
  .bottom-action-row {
    justify-content: flex-start;
  }

  .member-header-left {
    width: 100%;
  }

  .member-block {
    padding: 20px;
    border-radius: 22px;
  }

  .member-summary-btn h3,
  .toolbar-left h2 {
    font-size: 1.55rem;
  }

  .preview-image-wrap {
    height: 280px;
  }

  .modal-card {
    padding: 24px 18px 20px;
    border-radius: 22px;
  }

  .modal-card h3 {
    font-size: 1.35rem;
  }
}
</style>
