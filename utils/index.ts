import { ethers, BigNumber } from "ethers"

export const etherToWei = (amount: number | string) => ethers.utils.parseEther(amount.toString())

export const weiToEther = (wei: string | BigNumber) => parseFloat(ethers.utils.formatEther(wei))
