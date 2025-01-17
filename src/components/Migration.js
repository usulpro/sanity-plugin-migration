import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {useSecrets, SettingsView} from 'sanity-secrets'
import {ThemeProvider, Flex, Box, Spinner} from '@sanity/ui'

import MigrationQuery from './MigrationQuery'
import MigrationTool from './MigrationTool'
import ResetSecret from './ResetSecret'
import Feedback from './Feedback'

// Check for auth secret (required for asset uploads)
const secretNamespace = 'Migration'
const secretConfigKeys = [
  {
    key: 'bearerToken',
    title: 'An Auth Token for this studio. Get yours with `sanity debug --secrets`',
  },
]

export default function Migration({mode, docs}) {
  const secretsData = useSecrets(secretNamespace)
  const {loading, secrets = {}}  = secretsData ?? {}
  const [showSecretsPrompt, setShowSecretsPrompt] = useState(false)

  useEffect(() => {
    if (secrets) {
      setShowSecretsPrompt(!secrets?.bearerToken)
    }
  }, [secrets])

  if (!secretsData) {
    return <Feedback>Could not query for Secrets. You may have insufficient permissions on your account.</Feedback>
  }

  if (loading) {
    return (
      <ThemeProvider>
        <Flex justify="center" align="center">
          <Box padding={5}>
            <Spinner />
          </Box>
        </Flex>
      </ThemeProvider>
    )
  }

  if ((!loading && showSecretsPrompt) || !secrets?.bearerToken) {
    return (
      <ThemeProvider>
        <SettingsView
          namespace={secretNamespace}
          keys={secretConfigKeys}
          // eslint-disable-next-line react/jsx-no-bind
          onClose={() => setShowSecretsPrompt(false)}
        />
      </ThemeProvider>
    )
  }

  if (mode === 'tool') {
    return (
      <ThemeProvider>
        <MigrationQuery token={secrets?.bearerToken} />
        <ResetSecret />
      </ThemeProvider>
    )
  }

  if (!docs?.length) {
    return <Feedback>No docs passed into Migration Tool</Feedback>
  }

  return (
    <ThemeProvider>
      <MigrationTool docs={docs} token={secrets?.bearerToken} />
    </ThemeProvider>
  )
}

Migration.propTypes = {
  docs: PropTypes.arrayOf(PropTypes.shape({_id: PropTypes.string})),
  mode: PropTypes.string,
}

Migration.defaultProps = {
  docs: [],
  mode: 'tool',
}
