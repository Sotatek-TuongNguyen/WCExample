import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {
  WalletConnectModal,
  useWalletConnectModal,
} from '@walletconnect/modal-react-native';

const projectId = 'f4a74f07509fd80b3a3ddcb0f30d26e7';

const providerMetadata = {
  name: 'YOUR_PROJECT_NAME',
  description: 'YOUR_PROJECT_DESCRIPTION',
  url: 'https://your-project-website.com/',
  icons: ['https://your-project-logo.com/'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
    universal: 'YOUR_APP_UNIVERSAL_LINK.com',
  },
};

let sessionParams = {
  namespaces: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        'personal_sign',
        'wallet_addEthereumChain',
        'wallet_switchEthereumChain',
        'eth_chainId',
      ],
      chains: [
        'eip155:1', //eth
      ],
      events: ['chainChanged', 'accountsChanged', 'connect', 'disconnect'],
      rpcMap: {},
    },
  },
  optionalNamespaces: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        'personal_sign',
        'wallet_addEthereumChain',
        'wallet_switchEthereumChain',
        'eth_chainId',
      ],
      chains: [
        'eip155:137', //polygon
        'eip155:56', //bsc
      ],
      events: ['chainChanged', 'accountsChanged', 'connect', 'disconnect'],
      rpcMap: {},
    },
  },
};

function App() {
  const {open, isConnected, provider} = useWalletConnectModal();
  const [chainId, setChainId] = useState<any>(null);

  const _getChainId = async () => {
    const id = await provider?.request({
      method: 'eth_chainId',
    });
    setChainId(id);
  };

  useEffect(() => {
    _getChainId();
    provider?.on('chainChanged', _getChainId);
    return () => provider?.off('chainChanged', _getChainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, isConnected]);

  const _open = async () => {
    open();
  };

  const _disconnect = () => {
    provider?.disconnect();
  };

  const _switchChain = () => {
    const newChainId = Number(chainId) === 1 ? 137 : 1;
    provider
      ?.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: `0x${newChainId.toString(16)}`,
          },
        ],
      })
      .catch(error => {
        console.log({error});
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.text, styles.chain]}>ChainId: {chainId}</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={isConnected ? _disconnect : _open}>
        <Text style={styles.text}>
          {isConnected ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
      {isConnected ? (
        <TouchableOpacity style={styles.btn} onPress={_switchChain}>
          <Text style={styles.text}>Switch chain</Text>
        </TouchableOpacity>
      ) : null}
      <WalletConnectModal
        projectId={projectId}
        sessionParams={sessionParams}
        providerMetadata={providerMetadata}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  chain: {
    fontWeight: 'bold',
  },
  text: {
    color: '#3b3b3b',
  },
});

export default App;
