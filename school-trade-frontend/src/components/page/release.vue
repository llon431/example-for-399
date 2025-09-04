<template>
  <div>
    <AppHeader />
      <main class="release-idle-container">
        <div class="upload-container">
          <div class="header">
            <h2>📸 List Your Item</h2>
            <p class="subtitle">Share your unused items with the community</p>
          </div>

          <!-- Image Upload Section -->
          <div class="image-upload-section">
            <div class="image-upload-area" @click="$refs.fileInput.click()" :class="{ 'has-image': form.picture_list.length > 0 }">
              <div v-if="imagePreview.length === 0" class="upload-placeholder">
                <div class="upload-icon">📷</div>
                <p>Click to upload images</p>
                <span class="upload-hint">Supports PNG, JPG formats, up to 9 images</span>
              </div>
              <div v-else class="image-preview-container">
                <div v-for="(preview, index) in imagePreview" :key="index" class="image-preview">
                  <img :src="preview" :alt="`Preview ${index + 1}`" />
                  <div class="image-overlay">
                    <button type="button" @click.stop="removeImage(index)" class="remove-btn">×</button>
                  </div>
                </div>
              </div>
            </div>
            <input
                ref="fileInput"
                type="file"
                @change="onFileChange"
                accept="image/*"
                multiple
                style="display: none"
            />
          </div>

          <!-- Listing Type Selection -->
          <div class="listing-type-section">
            <h3 class="section-title">Choose Transaction Type</h3>
            <div class="listing-type-buttons">
              <button
                  type="button"
                  @click="form.idle_trade = 1"
                  :class="['type-btn', { active: form.idle_trade === 1 }]"
              >
                <div class="type-icon">💰</div>
                <div class="type-content">
                  <div class="type-title">Sell</div>
                  <div class="type-desc">Sell item for money</div>
                </div>
              </button>

              <button
                  type="button"
                  @click="form.idle_trade = 2"
                  :class="['type-btn', { active: form.idle_trade === 2 }]"
              >
                <div class="type-icon">🔄</div>
                <div class="type-content">
                  <div class="type-title">Exchange</div>
                  <div class="type-desc">Trade with other items</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">Item Name</span>
                <span class="required">*</span>
              </label>
              <input
                  v-model="form.idle_name"
                  type="text"
                  class="form-input"
                  placeholder="Enter item name"
                  maxlength="64"
              />
            </div>

            <!-- Sell Form Fields -->
            <template v-if="form.idle_trade === 1">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Original Price</span>
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-prefix">
                    <span class="prefix">$</span>
                    <input
                        v-model="form.idle_original_price"
                        type="number"
                        class="form-input with-prefix"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Current Price</span>
                    <span class="required">*</span>
                  </label>
                  <div class="input-with-prefix">
                    <span class="prefix">$</span>
                    <input
                        v-model="form.idle_price"
                        type="number"
                        class="form-input with-prefix"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                    />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="label-text">Condition</span>
                  <span class="required">*</span>
                </label>
                <select v-model="form.idle_new" class="form-input">
                  <option value="">Select condition</option>
                  <option value="1">Brand New</option>
                  <option value="2">Like New</option>
                  <option value="3">Used</option>
                </select>
              </div>
            </template>

            <!-- Exchange Form Fields -->
            <template v-else-if="form.idle_trade === 2">
              <div class="form-group">
                <label class="form-label">
                  <span class="label-text">Estimated Value</span>
                </label>
                <div class="input-with-prefix">
                  <span class="prefix">$</span>
                  <input
                      v-model="form.idle_price"
                      type="number"
                      class="form-input with-prefix"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="label-text">Condition</span>
                  <span class="required">*</span>
                </label>
                <select v-model="form.idle_new" class="form-input">
                  <option value="">Select condition</option>
                  <option value="1">Brand New</option>
                  <option value="2">Like New</option>
                  <option value="3">Used</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <span class="label-text">What I Want in Exchange</span>
                  <span class="required">*</span>
                </label>
                <textarea
                    v-model="form.exchange_wants"
                    class="form-textarea"
                    placeholder="Describe what you'd like to exchange for (e.g., books, electronics, clothing, etc.)"
                    rows="3"
                    maxlength="500"
                ></textarea>
              </div>
            </template>

            <!-- Common Fields -->
            <div class="form-group">
              <label class="form-label">
                <span class="label-text">Category</span>
                <span class="required">*</span>
              </label>
              <select v-model="form.idle_label" class="form-input">
                <option value="">Select category</option>
                <option value="univ">University</option>
                <option value="tech">Tech</option>
                <option value="clothes">Clothes</option>
                <option value="sports">Sports</option>
                <option value="living">Living</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-text">Item Details</span>
                <span class="required">*</span>
              </label>
              <textarea
                  v-model="form.idle_details"
                  class="form-textarea"
                  :placeholder="form.idle_trade === 1 ? 'Describe the item condition, features, and other details...' : 'Describe item details and reason for exchange...'"
                  rows="4"
                  maxlength="2048"
              ></textarea>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button @click="goBack" class="btn btn-secondary">
              ← Back
            </button>
            <button @click="submitForm" class="btn btn-primary" :disabled="!isFormValid">
              <span class="btn-text">{{ form.idle_trade === 1 ? 'List for Sale' : 'List for Exchange' }}</span>
              <span class="btn-icon">{{ form.idle_trade === 1 ? '💰' : '🔄' }}</span>
            </button>
          </div>
        </div>
      </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import AppHeader from '../common/AppHeader.vue';

const form = ref({
  idle_name: "",
  idle_details: "",
  picture_list: [], // Array of image files
  idle_price: "",
  idle_original_price: "",
  idle_label: "", // Now uses code instead of numeric ID
  idle_trade: 1, // 1=sell, 2=exchange
  idle_new: "", // 1=brand new, 2=like new, 3=used
  exchange_wants: "" // Description of wanted items for exchange
});

const imagePreview = ref([]);

const isFormValid = computed(() => {
  const baseValid = form.value.idle_name &&
      form.value.idle_details &&
      form.value.idle_label &&
      form.value.idle_new;

  if (form.value.idle_trade === 1) {
    return baseValid && form.value.idle_price && form.value.idle_original_price;
  } else {
    return baseValid && form.value.exchange_wants;
  }
});

const onFileChange = (e) => {
  const files = Array.from(e.target.files);

  files.forEach(file => {
    if (form.value.picture_list.length >= 9) {
      alert('Maximum 9 images allowed');
      return;
    }

    form.value.picture_list.push(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
  form.value.picture_list.splice(index, 1);
  imagePreview.value.splice(index, 1);
};

const goBack = () => {
  // Adjust according to your routing configuration
  window.history.back();
};

const submitForm = () => {
  if (!isFormValid.value) {
    alert("Please fill in all required fields");
    return;
  }

  // Build submit data that matches database structure
  const submitData = {
    idle_name: form.value.idle_name,
    idle_details: form.value.idle_details,
    picture_list: JSON.stringify(form.value.picture_list.map((file, index) => `image_${Date.now()}_${index}.${file.name.split('.').pop()}`)),
    idle_price: parseFloat(form.value.idle_price) || 0,
    idle_original_price: parseFloat(form.value.idle_original_price) || 0,
    idle_label: form.value.idle_label, // Now uses code string instead of numeric ID
    release_time: new Date().toISOString().slice(0, 19).replace('T', ' '), // MySQL DATETIME format
    idle_status: 1, // 1=published
    idle_trade: form.value.idle_trade,
    idle_new: parseInt(form.value.idle_new),
    user_id: 1, // Should get actual user ID from user state
    exchange_wants: form.value.exchange_wants // Added exchange wants field
  };

  console.log("Submit data:", submitData);

  // Call your API here
  // this.$api.addIdleItem(submitData).then(res => {
  //   if (res.status_code === 1) {
  //     alert(form.value.idle_trade === 1 ? 'Item listed for sale successfully!' : 'Item listed for exchange successfully!');
  //     // Navigate to details page
  //     this.$router.push({path: '/details', query: {id: res.data.id}});
  //   } else {
  //     alert('Listing failed: ' + res.msg);
  //   }
  // }).catch(e => {
  //   alert('Listing failed, please check your network connection!');
  // });

  const action = form.value.idle_trade === 1 ? 'sale' : 'exchange';
  alert(`Item listed for ${action} successfully! 🎉`);
};
</script>

<style scoped>
.release-idle-container {
  min-height: calc(100vh - 120px); /* Adjust based on header/footer height */
  background: #f8fafc;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.upload-container {
  background: white;
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

.image-upload-section {
  margin-bottom: 32px;
}

.image-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  position: relative;
  overflow: hidden;
  min-height: 120px;
}

.image-upload-area:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
}

.image-upload-area.has-image {
  border-style: solid;
  border-color: #10b981;
  background: white;
  padding: 16px;
}

.upload-placeholder {
  pointer-events: none;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.6;
}

.upload-placeholder p {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.upload-hint {
  color: #9ca3af;
  font-size: 0.875rem;
}

.image-preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.image-preview {
  position: relative;
  display: inline-block;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.image-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgb(239, 68, 68);
  transform: scale(1.1);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
}

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.prefix {
  position: absolute;
  left: 16px;
  color: #6b7280;
  font-weight: 600;
  z-index: 1;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  box-sizing: border-box;
}

.form-input.with-prefix {
  padding-left: 40px;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  gap: 16px;
}

.btn {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.btn-primary {
  background: #3b82f6;
  color: white;
  flex: 1;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.25);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Listing Type Selection Styles */
.listing-type-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 20px 0;
  text-align: center;
}

.listing-type-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.type-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.type-btn:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.type-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.type-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.type-content {
  flex: 1;
}

.type-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .release-idle-container {
    padding: 10px;
  }

  .upload-container {
    margin: 0;
    padding: 24px;
    border-radius: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .listing-type-buttons {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .image-preview-container {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>