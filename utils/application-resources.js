
/**
 * ITW CloudBase 应用资源适配工具
 * 将文章、视频、文档、ACH 四个模型的数据整理成统一格式。
 *
 * 注意：本文件只处理数据结构，不进行权限认证。
 * 云函数完成服务端权限校验前，不应向公开页面返回受限资源。
 */

const RESOURCE_KINDS = {
  article: true,
  video: true,
  document: true,
  ach: true
}

// 获取资源所属的应用 ID
function relationId(record) {
  if (!record || typeof record !== 'object') return ''

  const value = record.application

  if (typeof value === 'string') return value

  if (value && typeof value === 'object') {
    if (value._id) return value._id
    if (value.id) return value.id
  }

  const relation = record['@application']

  if (relation && relation.v1 && relation.v1.record) {
    return relation.v1.record._id || ''
  }

  return ''
}

// 提取 CloudBase 上传文件的地址或 fileID
function firstFile(value) {
  if (!value) return ''

  if (Array.isArray(value)) {
    return firstFile(value[0])
  }

  if (typeof value === 'string') {
    const text = value.trim()

    if (/^[\[{]/.test(text)) {
      try {
        return firstFile(JSON.parse(text))
      } catch (error) {
        return ''
      }
    }

    return text
  }

  if (typeof value === 'object') {
    return firstFile(
      value.fileID ||
      value.fileId ||
      value.cloudPath ||
      value.tempFileURL ||
      value.download_url ||
      value.url ||
      value.value
    )
  }

  return ''
}

// 统一四类资源的数据字段
function normalizeResource(record) {
  if (!record || typeof record !== 'object') return null
  if (record.visible === false) return null

  const kind = record.resourceKind

  if (!RESOURCE_KINDS[kind]) return null

  const applicationId = relationId(record)

  if (!applicationId) return null

  return {
    id: record.code || record._id || '',
    cloudId: record._id || '',
    applicationId: applicationId,
    kind: kind,
    title: record.title || '未命名资源',
    summary: record.summary || '',
    sort: Number.isFinite(Number(record.sort))
      ? Number(record.sort)
      : 0,
    access: record.accessScope || 'certified',
    coverImage: firstFile(record.coverImage),
    resourceFile: firstFile(record.resourceFile),
    externalUrl: typeof record.externalUrl === 'string'
      ? record.externalUrl
      : '',
    visible: true
  }
}

// 根据应用 ID 对资源分组
function groupByApplication(payload) {
  if (
    !payload ||
    payload.ok !== true ||
    !Array.isArray(payload.resources)
  ) {
    throw new Error('应用资源接口返回格式无效')
  }

  const groups = {}

  payload.resources.forEach(record => {
    const resource = normalizeResource(record)

    if (!resource) return

    const applicationId = resource.applicationId

    if (!groups[applicationId]) {
      groups[applicationId] = []
    }

    groups[applicationId].push(resource)
  })

  // 数值越小，排序越靠前
  Object.keys(groups).forEach(applicationId => {
    groups[applicationId].sort(
      (a, b) => a.sort - b.sort
    )
  })

  return groups
}

module.exports = {
  relationId,
  firstFile,
  normalizeResource,
  groupByApplication
}
