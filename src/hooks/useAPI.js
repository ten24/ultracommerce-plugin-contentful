import { useState, useEffect } from 'react'
import { SlatwalApiService, axios } from '../services'

const headers = {}

export const useGetEntity = () => {
  let [request, setRequest] = useState({ isFetching: false, isLoaded: false, makeRequest: false, data: [], error: '', params: {}, entity: '' })
  useEffect(() => {
    let source = axios.CancelToken.source()
    if (request.makeRequest) {
      const payload = { ...request.params, entityName: request.entity, includeAttributesMetadata: true }

      SlatwalApiService.general.getEntity(payload, headers, source).then(response => {
        if (response.isSuccess() && response.success().data && response.success().data.pageRecords) {
          setRequest({ data: response.success().data.pageRecords, attributeSets: response.success().attributeSets, isFetching: false, isLoaded: true, makeRequest: false, params: {} })
        } else if (response.isSuccess() && response.success().data && response.success().data[request.entity]) {
          setRequest({ data: response.success().data[request.entity], attributeSets: response.success().attributeSets, isFetching: false, isLoaded: true, makeRequest: false, params: {} })
        } else {
          setRequest({ data: [], attributeSets: [], isFetching: false, makeRequest: false, isLoaded: true, params: {}, error: 'Something was wrong' })
        }
      })
    }
    return () => {
      source.cancel()
    }
  }, [request, setRequest])

  return [request, setRequest]
}

export const useGetProductsByEntity = () => {
  let [request, setRequest] = useState({ isFetching: false, isLoaded: false, makeRequest: false, data: [], error: '', params: {}, entity: '' })
  useEffect(() => {
    let source = axios.CancelToken.source()
    if (request.makeRequest) {
      const payload = { ...request.params, entityName: 'Product', includeAttributesMetadata: true }

      SlatwalApiService.general.getEntity(payload, headers, source).then(response => {
        if (response.isSuccess()) {
          setRequest({ data: response.success().data, attributeSets: response.success().attributeSets, isFetching: false, isLoaded: true, makeRequest: false, params: {} })
        } else {
          setRequest({ data: [], attributeSets: [], isFetching: false, makeRequest: false, isLoaded: true, params: {}, error: 'Something was wrong' })
        }
      })
    }
    return () => {
      source.cancel()
    }
  }, [request, setRequest])

  return [request, setRequest]
}
